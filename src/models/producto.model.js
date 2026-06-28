const mongoose = require("mongoose");

const categoriaProductoSchema = new mongoose.Schema(
    {
        id_categoria: { type: Number, required: true },
        nombre: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const proveedorProductoSchema = new mongoose.Schema(
    {
        id_proveedor: { type: Number, required: true },
        nombre: { type: String, required: true },
        ruc: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const inventarioSchema = new mongoose.Schema(
    {
        id_inventario: { type: Number, required: true },
        stock: { type: Number, required: true },
        fecha_actualizacion: { type: Date, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const productoSchema = new mongoose.Schema(
    {
        id_producto: { type: Number, required: true },
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        precio: { type: Number, required: true },
        stock_csv: { type: Number, required: true },
        categoria: { type: categoriaProductoSchema, required: true },
        proveedor: { type: proveedorProductoSchema, required: true },
        inventario: { type: inventarioSchema, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "productos"
    }
);

module.exports = mongoose.models.productos || mongoose.model("productos", productoSchema);
