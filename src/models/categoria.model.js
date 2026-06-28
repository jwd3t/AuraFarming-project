const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
    {
        id_categoria: { type: Number, required: true },
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "categorias"
    }
);

module.exports = mongoose.models.categorias || mongoose.model("categorias", categoriaSchema);
