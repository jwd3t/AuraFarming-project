const mongoose = require("mongoose");

const HttpError = require("../errors/http-error");

class CollectionService {
    constructor(definition) {
        this.definition = definition;
        this.model = definition.model;
    }

    async list() {
        this.ensureDatabaseConnection();
        return this.model.find({}).lean();
    }

    async getById(id) {
        this.ensureDatabaseConnection();

        const document = await this.findById(id);

        if (!document) {
            throw new HttpError(404, "Documento no encontrado");
        }

        return document;
    }

    async create(payload) {
        this.ensureDatabaseConnection();

        try {
            const document = this.validatePayload(payload, { requireCompleteDocument: true });
            const createdDocument = await this.model.create(document);
            return createdDocument.toObject();
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async replace(id, payload) {
        this.ensureDatabaseConnection();

        try {
            const existingDocument = await this.findById(id);

            if (!existingDocument) {
                throw new HttpError(404, "Documento no encontrado");
            }

            const document = this.validatePayload(payload, { requireCompleteDocument: true });
            await this.model.replaceOne(
                { _id: existingDocument._id },
                { ...document, _id: existingDocument._id },
                { runValidators: true }
            );

            return this.findById(existingDocument._id);
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async update(id, payload) {
        this.ensureDatabaseConnection();

        try {
            const existingDocument = await this.findById(id);

            if (!existingDocument) {
                throw new HttpError(404, "Documento no encontrado");
            }

            const document = this.validatePayload(payload, { requireCompleteDocument: false });
            const updatedDocument = await this.model.findByIdAndUpdate(
                existingDocument._id,
                { $set: document },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            ).lean();

            return updatedDocument;
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async remove(id) {
        this.ensureDatabaseConnection();

        try {
            const document = await this.model.findByIdAndDelete(id).lean();

            if (!document) {
                throw new HttpError(404, "Documento no encontrado");
            }

            return document;
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    validatePayload(payload, options) {
        if (!payload || Array.isArray(payload) || typeof payload !== "object") {
            throw new HttpError(400, "El body debe ser un objeto JSON");
        }

        const { _id, ...safePayload } = payload;
        const payloadKeys = Object.keys(safePayload);

        if (payloadKeys.length === 0) {
            throw new HttpError(400, "El body no puede estar vacio");
        }

        const unknownFields = payloadKeys.filter((field) => !this.definition.requiredFields.includes(field));

        if (unknownFields.length > 0) {
            throw new HttpError(400, "El body contiene campos no permitidos", {
                allowedFields: this.definition.requiredFields,
                unknownFields
            });
        }

        if (options.requireCompleteDocument) {
            const missingFields = this.definition.requiredFields.filter((field) => !payloadKeys.includes(field));

            if (missingFields.length > 0) {
                throw new HttpError(
                    400,
                    "Para POST y PUT debes enviar el documento completo de la coleccion",
                    {
                        requiredFields: this.definition.requiredFields,
                        missingFields
                    }
                );
            }
        }

        return safePayload;
    }

    ensureDatabaseConnection() {
        if (mongoose.connection.readyState !== 1) {
            throw new HttpError(503, "La conexion con MongoDB no esta lista");
        }
    }

    async findById(id) {
        try {
            return await this.model.findById(id).lean();
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    handlePersistenceError(error) {
        if (error instanceof HttpError) {
            throw error;
        }

        if (error.reason?.name === "StrictModeError") {
            throw new HttpError(400, this.formatStrictModeMessage(error.reason.message));
        }

        if (error.reason?.name === "ValidationError") {
            throw new HttpError(400, "El body no cumple con el schema", {
                errors: Object.values(error.reason.errors).map((item) => item.message)
            });
        }

        if (error.name === "CastError") {
            if (error.path === "_id") {
                throw new HttpError(400, "El id enviado no es valido");
            }

            throw new HttpError(400, error.message);
        }

        if (error.name === "StrictModeError") {
            throw new HttpError(400, this.formatStrictModeMessage(error.message));
        }

        if (error.name === "ValidationError") {
            throw new HttpError(400, "El body no cumple con el schema", {
                errors: Object.values(error.errors).map((item) => item.message)
            });
        }

        throw error;
    }

    formatStrictModeMessage(message) {
        const match = message.match(/Field `(.*)` is not in schema/);

        if (match) {
            return `El campo '${match[1]}' no esta permitido en el schema`;
        }

        return message;
    }
}

module.exports = CollectionService;
