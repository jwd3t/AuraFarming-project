const { Router } = require("express");

const { collectionDefinitions, collectionNames } = require("../config/collections");
const createCollectionRouter = require("./collection.routes");

const router = Router();

router.get("/home", (req, res) => {
    res.send("Bien venidos");
});

router.get("/collections", (req, res) => {
    res.json(collectionNames);
});

collectionDefinitions.forEach((definition) => {
    router.use(`/${definition.name}`, createCollectionRouter(definition));
});

module.exports = router;
