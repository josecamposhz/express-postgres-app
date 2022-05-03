const { Pool } = require('pg');
require('dotenv').config();

/* const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "root",
    database: "super",
    port: 5432
}) */

// set production variable. This will be called when deployed to a live host
const isProduction = process.env.NODE_ENV === 'production';

// configuration details
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// if project has been deployed, connect with the host's DATABASE_URL
// else connect with the local DATABASE_URL
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
});

// display message on success if successful
pool.on('connect', () => {
    console.log('Teamwork Database connected successfully!');
});

const getProductos = async () => {
    const { rows } = await pool.query({
        text: "SELECT * FROM productos ORDER BY id ASC"
    });
    return rows;
}

const updateProducto = async ({ nombre, precio, stock }, id) => {
    const consulta = {
        text: "UPDATE productos SET nombre = $2, precio = $3, stock = $4 WHERE id = $1 RETURNING *",
        values: [id, nombre, precio, stock],
    };
    const result = await pool.query(consulta);
    return result;
};

const getCompras = async () => {
    const { rows } = await pool.query("SELECT * FROM compras");
    return rows;
}

const registrarCompra = async (productos) => {
    try {
        await pool.query("BEGIN");

        const result = await pool.query({
            text: "INSERT INTO compras (fecha) values (NOW()) RETURNING *;",
        });

        const compra = result.rows[0];

        for (let i = 0; i < productos.length; i++) {
            // agregamos el producto al detalle de compra
            await pool.query({
                text: "INSERT INTO detalle_compra (compra_id, producto_id, cantidad) values ($1, $2, $3);",
                values: [compra.id, productos[i].id, productos[i].cantidad]
            });

            // actualizamos el stock del producto
            let { rowCount } = await pool.query({
                text: "UPDATE productos SET stock = stock - $2 WHERE id = $1;",
                values: [productos[i].id, productos[i].cantidad]
            });

            // validamos que el stock del producto fue actualizado
            if (!rowCount) {
                throw Error(`Ocurrio un error al actualizar el producto: ${productos[i].nombre}`);
            };
        };

        await pool.query("COMMIT");

        return compra;
    } catch (error) {
        await pool.query("ROLLBACK");
        console.log(error)
        throw error;
    }
}

const eliminarCompra = async (id) => {
    const result = await pool.query({
        text: `DELETE FROM compras WHERE id = $1`,
        values: [id]
    });
    return result.rows;
};

const getDetalleCompra = async (compra_id) => {
    const { rows } = await pool.query({
        text: `
            SELECT productos.nombre, detalle_compra.cantidad FROM detalle_compra
            INNER JOIN productos ON productos.id = detalle_compra.producto_id
            WHERE compra_id = $1
        `,
        values: [compra_id]
    });
    return rows;
};

module.exports = { getProductos, updateProducto, getCompras, registrarCompra, eliminarCompra, getDetalleCompra };