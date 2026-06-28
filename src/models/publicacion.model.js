const mongoose = require("mongoose");

const categoriaPublicacionSchema = new mongoose.Schema(
    {
        id_categoria: { type: Number, required: true },
        nombre: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const productoPublicacionSchema = new mongoose.Schema(
    {
        id_producto: { type: Number, required: true },
        nombre: { type: String, required: true },
        categoria: { type: categoriaPublicacionSchema, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const autorSchema = new mongoose.Schema(
    {
        id_cliente: { type: Number, required: true },
        nombre_completo: { type: String, required: true },
        email: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const metricasSchema = new mongoose.Schema(
    {
        likes: { type: Number, required: true },
        compartidos: { type: Number, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const publicacionSchema = new mongoose.Schema(
    {
        id_publicacion: { type: Number, required: true },
        fecha: { type: Date, required: true },
        texto: { type: String, required: true },
        autor: { type: autorSchema, required: true },
        producto: { type: productoPublicacionSchema, default: null },
        metricas: { type: metricasSchema, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "publicaciones"
    }
);

module.exports = mongoose.models.publicaciones || mongoose.model("publicaciones", publicacionSchema);
