const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
    {
        id_proveedor: { type: Number, required: true },
        nombre: { type: String, required: true },
        contacto: { type: String, required: true },
        ruc: { type: String, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "proveedores"
    }
);

module.exports = mongoose.models.proveedores || mongoose.model("proveedores", proveedorSchema);
