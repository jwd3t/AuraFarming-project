const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");

const { collectionDefinitions, collectionNames } = require("../config/collections");

function registerSwagger(app) {
    const spec = buildOpenApiSpec();

    app.get("/api-docs.json", (req, res) => {
        res.json(spec);
    });

    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(spec));
}

function buildOpenApiSpec() {
    const schemas = {};
    const paths = {
        "/collections": {
            get: {
                tags: ["Meta"],
                summary: "Lista las colecciones disponibles",
                responses: {
                    200: {
                        description: "Colecciones registradas en la API",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        enum: collectionNames
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    collectionDefinitions.forEach((definition) => {
        const schemaName = toSchemaName(definition.name);
        schemas[schemaName] = buildSchemaFromMongooseModel(definition.model);

        paths[`/${definition.name}`] = {
            get: {
                tags: [schemaName],
                summary: `Lista documentos de ${definition.name}`,
                responses: {
                    200: {
                        description: `Listado de ${definition.name}`,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: `#/components/schemas/${schemaName}` }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [schemaName],
                summary: `Crea un documento en ${definition.name}`,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}Input` }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Documento creado",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    },
                    400: {
                        description: "Body invalido"
                    }
                }
            }
        };

        paths[`/${definition.name}/{id}`] = {
            get: {
                tags: [schemaName],
                summary: `Obtiene un documento de ${definition.name} por id`,
                parameters: [idParameter()],
                responses: {
                    200: {
                        description: "Documento encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    },
                    404: {
                        description: "Documento no encontrado"
                    }
                }
            },
            put: {
                tags: [schemaName],
                summary: `Reemplaza un documento completo de ${definition.name}`,
                description: "Debes enviar todos los campos requeridos del documento.",
                parameters: [idParameter()],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}Input` }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Documento reemplazado",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    },
                    400: {
                        description: "Body invalido o incompleto"
                    },
                    404: {
                        description: "Documento no encontrado"
                    }
                }
            },
            patch: {
                tags: [schemaName],
                summary: `Actualiza parcialmente un documento de ${definition.name}`,
                parameters: [idParameter()],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}Patch` }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Documento actualizado",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    },
                    400: {
                        description: "Body invalido"
                    },
                    404: {
                        description: "Documento no encontrado"
                    }
                }
            },
            delete: {
                tags: [schemaName],
                summary: `Elimina un documento de ${definition.name}`,
                parameters: [idParameter()],
                responses: {
                    200: {
                        description: "Documento eliminado",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    },
                    404: {
                        description: "Documento no encontrado"
                    }
                }
            }
        };

        schemas[`${schemaName}Input`] = buildInputSchema(schemas[schemaName]);
        schemas[`${schemaName}Patch`] = buildPatchSchema(schemas[schemaName]);
    });

    schemas.ErrorResponse = {
        type: "object",
        properties: {
            message: { type: "string", example: "Documento no encontrado" },
            details: { type: "object", additionalProperties: true }
        }
    };

    return {
        openapi: "3.0.3",
        info: {
            title: "AuraFarma API",
            version: "1.0.0",
            description: "Documentacion interactiva de los endpoints CRUD de AuraFarma."
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local"
            }
        ],
        tags: [
            { name: "Meta", description: "Endpoints de apoyo y descubrimiento" },
            ...collectionDefinitions.map((definition) => ({
                name: toSchemaName(definition.name),
                description: `Operaciones CRUD sobre ${definition.name}`
            }))
        ],
        paths,
        components: {
            schemas
        }
    };
}

function buildSchemaFromMongooseModel(model) {
    const schema = convertDefinition(model.schema.obj);
    schema.type = "object";
    schema.properties = {
        _id: {
            type: "string",
            example: "6a4053e2de2d7277b667ba9f"
        },
        ...schema.properties
    };

    return schema;
}

function buildInputSchema(baseSchema) {
    const inputSchema = clone(baseSchema);
    delete inputSchema.properties._id;
    inputSchema.required = inputSchema.required || [];
    return inputSchema;
}

function buildPatchSchema(baseSchema) {
    const patchSchema = clone(baseSchema);
    delete patchSchema.properties._id;
    delete patchSchema.required;
    return patchSchema;
}

function convertDefinition(definition) {
    if (Array.isArray(definition)) {
        return {
            type: "array",
            items: convertDefinition(definition[0])
        };
    }

    if (definition instanceof mongoose.Schema) {
        return convertDefinition(definition.obj);
    }

    if (isFieldDefinition(definition)) {
        return convertFieldDefinition(definition);
    }

    const properties = {};
    const required = [];

    Object.entries(definition).forEach(([key, value]) => {
        properties[key] = convertDefinition(value);

        if (isRequiredField(value)) {
            required.push(key);
        }
    });

    const schema = {
        type: "object",
        properties
    };

    if (required.length > 0) {
        schema.required = required;
    }

    return schema;
}

function convertFieldDefinition(definition) {
    if (Array.isArray(definition.type)) {
        return {
            type: "array",
            items: convertDefinition(definition.type[0])
        };
    }

    if (definition.type instanceof mongoose.Schema) {
        return convertDefinition(definition.type);
    }

    if (definition.type === String) {
        return { type: "string" };
    }

    if (definition.type === Number) {
        return { type: "number" };
    }

    if (definition.type === Boolean) {
        return { type: "boolean" };
    }

    if (definition.type === Date) {
        return { type: "string", format: "date-time" };
    }

    if (definition.type === Object) {
        return { type: "object", additionalProperties: true };
    }

    return { type: "object" };
}

function isFieldDefinition(definition) {
    return Boolean(definition && typeof definition === "object" && Object.prototype.hasOwnProperty.call(definition, "type"));
}

function isRequiredField(definition) {
    return Boolean(definition && typeof definition === "object" && definition.required);
}

function idParameter() {
    return {
        name: "id",
        in: "path",
        required: true,
        description: "Identificador `_id` del documento en MongoDB",
        schema: {
            type: "string"
        }
    };
}

function toSchemaName(collectionName) {
    return collectionName
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

module.exports = {
    buildOpenApiSpec,
    registerSwagger
};
