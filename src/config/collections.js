const models = require("../models");

const collectionDefinitions = [
    {
        name: "metodos_pago",
        model: models.metodos_pago,
        requiredFields: ["id_metodo", "tipo", "descripcion"]
    },
    {
        name: "categorias",
        model: models.categorias,
        requiredFields: ["id_categoria", "nombre", "descripcion"]
    },
    {
        name: "productos",
        model: models.productos,
        requiredFields: [
            "id_producto",
            "nombre",
            "descripcion",
            "precio",
            "stock_csv",
            "categoria",
            "proveedor",
            "inventario"
        ]
    },
    {
        name: "pedidos",
        model: models.pedidos,
        requiredFields: [
            "id_pedido",
            "fecha",
            "estado",
            "cliente",
            "items",
            "total_calculado",
            "pago"
        ]
    },
    {
        name: "clientes",
        model: models.clientes,
        requiredFields: [
            "id_cliente",
            "nombre",
            "apellido",
            "nombre_completo",
            "email",
            "telefono",
            "direcciones"
        ]
    },
    {
        name: "proveedores",
        model: models.proveedores,
        requiredFields: ["id_proveedor", "nombre", "contacto", "ruc"]
    },
    {
        name: "publicaciones",
        model: models.publicaciones,
        requiredFields: ["id_publicacion", "fecha", "texto", "autor", "producto", "metricas"]
    }
];

const collectionMap = collectionDefinitions.reduce((accumulator, definition) => {
    accumulator[definition.name] = definition;
    return accumulator;
}, {});

module.exports = {
    collectionDefinitions,
    collectionMap,
    collectionNames: collectionDefinitions.map((definition) => definition.name)
};
