const express = require('express');
const db = require('./db');

const app = express();

app.listen(3000, console.log("SERVER ON http://localhost:3000"));

// middlewares
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// views
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});
app.get("/formulario", (req, res) => {
    res.sendFile(__dirname + "/views/formulario.html");
});
app.get("/detalle/:id", (req, res) => {
    res.sendFile(__dirname + "/views/detalle.html");
});

app.post("/compras", async (req, res) => {
    try {
        const compra = req.body;
        const result = await db.registrarCompra(compra);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/compras", async (req, res) => {
    try {
        const compras = await db.getCompras();
        res.json(compras);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/compras/:id", async (req, res) => {
    try {
        const detalle = await db.getDetalleCompra(req.params.id);
        res.json(detalle);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.delete("/compras/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.eliminarCompra(id);
        res.send("Compra eliminada con éxito");
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/productos", async (req, res) => {
    try {
        const productos = await db.getProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.put("/productos/:id", async (req, res) => {
    try {
        const respuesta = await db.updateProducto(req.body, req.params.id);
        res.json(respuesta);
    } catch (error) {
        res.status(500).send(error);
    }
})