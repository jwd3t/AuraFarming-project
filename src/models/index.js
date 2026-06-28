const Categoria = require("./categoria.model");
const Cliente = require("./cliente.model");
const MetodoPago = require("./metodo-pago.model");
const Pedido = require("./pedido.model");
const Producto = require("./producto.model");
const Proveedor = require("./proveedor.model");
const Publicacion = require("./publicacion.model");

module.exports = {
    categorias: Categoria,
    clientes: Cliente,
    metodos_pago: MetodoPago,
    pedidos: Pedido,
    productos: Producto,
    proveedores: Proveedor,
    publicaciones: Publicacion
};
