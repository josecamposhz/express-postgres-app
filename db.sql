CREATE DATABASE super;

CREATE TABLE compras (id SERIAL PRIMARY KEY, fecha DATE);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    precio INT,
    stock INT CHECK (stock >= 0)
);

CREATE TABLE detalle_compra (
    compra_id INT,
    producto_id INT,
    cantidad INT,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

INSERT INTO
    productos(id, nombre, stock, precio)
VALUES
    (1, 'Helado', 6, 910),
    (2, 'Pelota', 5, 170),
    (3, 'Chocolate', 9, 950),
    (4, 'Café', 8, 195);