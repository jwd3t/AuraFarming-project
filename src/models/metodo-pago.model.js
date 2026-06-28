const mongoose = require("mongoose");

const metodoPagoSchema = new mongoose.Schema(
    {
        id_metodo: { type: Number, required: true },
        tipo: { type: String, required: true },
        descripcion: { type: String, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "metodos_pago"
    }
);

module.exports = mongoose.models.metodos_pago || mongoose.model("metodos_pago", metodoPagoSchema);
