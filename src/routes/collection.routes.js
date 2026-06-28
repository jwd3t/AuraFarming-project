const { Router } = require("express");

const CollectionController = require("../controllers/collection.controller");

function createCollectionRouter(definition) {
    const router = Router();
    const controller = new CollectionController(definition);

    router.get("/", controller.list);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.replace);
    router.patch("/:id", controller.update);
    router.delete("/:id", controller.remove);

    return router;
}

module.exports = createCollectionRouter;
