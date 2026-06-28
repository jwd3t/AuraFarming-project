const mongoose = require("mongoose");

const direccionSchema = new mongoose.Schema(
    {
        id_direccion: { type: Number, required: true },
        direccion: { type: String, required: true },
        distrito: { type: String, required: true },
        referencia: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const clienteSchema = new mongoose.Schema(
    {
        id_cliente: { type: Number, required: true },
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        nombre_completo: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true },
        direcciones: { type: direccionSchema, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "clientes"
    }
);

module.exports = mongoose.models.clientes || mongoose.model("clientes", clienteSchema);
