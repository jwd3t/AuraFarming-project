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

const productoItemSchema = new mongoose.Schema(
    {
        id_producto: { type: Number, required: true },
        nombre: { type: String, required: true },
        categoria: { type: categoriaProductoSchema, required: true },
        proveedor: { type: proveedorProductoSchema, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const itemPedidoSchema = new mongoose.Schema(
    {
        id_detalle: { type: Number, required: true },
        producto: { type: productoItemSchema, required: true },
        cantidad: { type: Number, required: true },
        precio_unitario: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const clientePedidoSchema = new mongoose.Schema(
    {
        id_cliente: { type: Number, required: true },
        nombre_completo: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const metodoPagoSchema = new mongoose.Schema(
    {
        id_metodo: { type: Number, required: true },
        tipo: { type: String, required: true },
        descripcion: { type: String, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const pagoSchema = new mongoose.Schema(
    {
        id_pago: { type: Number, required: true },
        monto: { type: Number, required: true },
        estado: { type: String, required: true },
        metodo: { type: metodoPagoSchema, required: true }
    },
    {
        _id: false,
        strict: "throw"
    }
);

const pedidoSchema = new mongoose.Schema(
    {
        id_pedido: { type: Number, required: true },
        fecha: { type: Date, required: true },
        estado: { type: String, required: true },
        cliente: { type: clientePedidoSchema, required: true },
        items: { type: [itemPedidoSchema], required: true },
        total_calculado: { type: Number, required: true },
        pago: { type: pagoSchema, required: true }
    },
    {
        versionKey: false,
        strict: "throw",
        collection: "pedidos"
    }
);

module.exports = mongoose.models.pedidos || mongoose.model("pedidos", pedidoSchema);
