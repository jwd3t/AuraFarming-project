const express = require("express");
const { registerSwagger } = require("./docs/swagger");

const app = express();
require("./database.js");

app.use(express.json());
registerSwagger(app);

app.use(require("./routes/index.routes.js"));

app.get("/", (req, res) => {
    res.send("AuraFarma API");
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server en el puerto ${PORT}`);
    });
}

module.exports = app;

