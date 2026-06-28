const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/aurafarma_db";

mongoose.connect(mongoUri)
    .then((db) => console.log("DB is connected to", db.connection.host))
    .catch((err) => console.error(err));
