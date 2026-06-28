const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const mongoose = require("mongoose");

const app = require("../src/index");
const { collectionNames } = require("../src/config/collections");

let server;
let baseUrl;
let sampleClient;

before(async () => {
    await waitForConnection();

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;

    const clientsResponse = await request("/clientes");
    sampleClient = clientsResponse.body.find((client) => client.id_cliente === 1) || clientsResponse.body[0];

    assert.ok(sampleClient, "No se encontro un cliente de prueba");
});

after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});

test("GET /collections devuelve las colecciones configuradas", async () => {
    const response = await request("/collections");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, collectionNames);
});

test("GET /api-docs.json expone la especificacion OpenAPI", async () => {
    const response = await request("/api-docs.json");

    assert.equal(response.status, 200);
    assert.equal(response.body.openapi, "3.0.3");
    assert.equal(response.body.info.title, "AuraFarma API");
    assert.ok(response.body.paths["/clientes"]);
    assert.ok(response.body.paths["/clientes/{id}"]);
});

test("GET /api-docs devuelve la UI de Swagger", async () => {
    const response = await fetch(`${baseUrl}/api-docs`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Swagger UI/i);
});

test("GET /clientes/:id devuelve un cliente existente", async () => {
    const response = await request(`/clientes/${sampleClient._id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body._id, sampleClient._id);
    assert.equal(response.body.id_cliente, sampleClient.id_cliente);
    assert.equal(response.body.nombre_completo, sampleClient.nombre_completo);
    assert.equal(response.body.direcciones.id_direccion, sampleClient.direcciones.id_direccion);
});

test("GET /productos devuelve referencias anidadas con _id de MongoDB", async () => {
    const response = await request("/productos");
    const producto = response.body[0];

    assert.equal(response.status, 200);
    assert.equal(producto.id_producto, 1);
    assert.equal(producto.categoria.id_categoria, 1);
    assert.equal(producto.proveedor.id_proveedor, 1);
    assert.equal(producto.inventario.id_inventario, 1);
});

test("GET /pedidos devuelve items normalizados y referencias anidadas con _id", async () => {
    const response = await request("/pedidos");
    const pedido = response.body[0];
    const item = pedido.items[0];

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(pedido.items));
    assert.equal(pedido.id_pedido, 1);
    assert.equal(pedido.cliente.id_cliente, 1);
    assert.equal(item.id_detalle, 1);
    assert.equal(item.producto.id_producto, 1);
    assert.equal(item.producto.categoria.id_categoria, 1);
    assert.equal(item.producto.proveedor.id_proveedor, 1);
    assert.equal(pedido.pago.id_pago, 1);
    assert.equal(pedido.pago.metodo.id_metodo, 1);
});

test("GET /publicaciones devuelve autor y producto referenciados con _id", async () => {
    const response = await request("/publicaciones");
    const publicacion = response.body.find((item) => item.producto) || response.body[0];

    assert.equal(response.status, 200);
    assert.equal(publicacion.id_publicacion, 1);
    assert.equal(publicacion.autor.id_cliente, 1);

    if (publicacion.producto) {
        assert.equal(publicacion.producto.id_producto, 1);
        assert.equal(publicacion.producto.categoria.id_categoria, 1);
    }
});

test("PUT parcial se rechaza y no reemplaza el documento", async () => {
    const original = await request(`/clientes/${sampleClient._id}`);

    const response = await request(`/clientes/${sampleClient._id}`, {
        method: "PUT",
        body: JSON.stringify({ nombre: "Solo nombre" })
    });

    const afterUpdateAttempt = await request(`/clientes/${sampleClient._id}`);

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        "Para POST y PUT debes enviar el documento completo de la coleccion"
    );
    assert.ok(response.body.details.missingFields.includes("apellido"));
    assert.deepEqual(afterUpdateAttempt.body, original.body);
});

test("PATCH con campo top-level desconocido se rechaza", async () => {
    const original = await request(`/clientes/${sampleClient._id}`);

    const response = await request(`/clientes/${sampleClient._id}`, {
        method: "PATCH",
        body: JSON.stringify({ asdasd: "asdasd" })
    });

    const afterUpdateAttempt = await request(`/clientes/${sampleClient._id}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "El body contiene campos no permitidos");
    assert.deepEqual(response.body.details.unknownFields, ["asdasd"]);
    assert.deepEqual(afterUpdateAttempt.body, original.body);
});

test("PATCH con campo desconocido dentro de un subdocumento se rechaza", async () => {
    const original = await request(`/clientes/${sampleClient._id}`);

    const response = await request(`/clientes/${sampleClient._id}`, {
        method: "PATCH",
        body: JSON.stringify({
            direcciones: {
                id_direccion: original.body.direcciones.id_direccion,
                direccion: original.body.direcciones.direccion,
                distrito: original.body.direcciones.distrito,
                referencia: original.body.direcciones.referencia,
                extra: "no permitido"
            }
        })
    });

    const afterUpdateAttempt = await request(`/clientes/${sampleClient._id}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "El campo 'extra' no esta permitido en el schema");
    assert.deepEqual(afterUpdateAttempt.body, original.body);
});

test("POST incompleto se rechaza", async () => {
    const response = await request("/clientes", {
        method: "POST",
        body: JSON.stringify({
            nombre: "Temporal",
            apellido: "Prueba"
        })
    });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        "Para POST y PUT debes enviar el documento completo de la coleccion"
    );
    assert.ok(response.body.details.missingFields.includes("email"));
});

test("DELETE de un id inexistente responde 404", async () => {
    const nonexistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(`/clientes/${nonexistentId}`, {
        method: "DELETE"
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Documento no encontrado");
});

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const rawBody = await response.text();
    const body = rawBody ? JSON.parse(rawBody) : null;

    return {
        status: response.status,
        body
    };
}

async function waitForConnection() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    await new Promise((resolve, reject) => {
        const onOpen = () => {
            cleanup();
            resolve();
        };

        const onError = (error) => {
            cleanup();
            reject(error);
        };

        const cleanup = () => {
            mongoose.connection.off("open", onOpen);
            mongoose.connection.off("error", onError);
        };

        mongoose.connection.on("open", onOpen);
        mongoose.connection.on("error", onError);
    });
}
