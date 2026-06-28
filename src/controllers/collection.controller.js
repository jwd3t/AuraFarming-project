const CollectionService = require("../services/collection.service");

class CollectionController {
    constructor(definition) {
        this.service = new CollectionService(definition);

        this.list = this.list.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.replace = this.replace.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    async list(req, res) {
        try {
            const documents = await this.service.list();
            res.json(documents);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getById(req, res) {
        try {
            const document = await this.service.getById(req.params.id);
            res.json(document);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async create(req, res) {
        try {
            const document = await this.service.create(req.body);
            res.status(201).json(document);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async replace(req, res) {
        try {
            const document = await this.service.replace(req.params.id, req.body);
            res.json(document);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async update(req, res) {
        try {
            const document = await this.service.update(req.params.id, req.body);
            res.json(document);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async remove(req, res) {
        try {
            const document = await this.service.remove(req.params.id);
            res.json(document);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    handleError(res, error) {
        const status = error.status || 500;
        const response = { message: error.message || "Error interno del servidor" };

        if (error.details) {
            response.details = error.details;
        }

        res.status(status).json(response);
    }
}

module.exports = CollectionController;
