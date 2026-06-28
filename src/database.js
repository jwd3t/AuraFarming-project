// ENV PROD
/*const mongoose = require("mongoose");

mongoose.connect("mongodb://database/mydatabase")
    .then(db=>console.log("DB is connected to", db.connection.host))
    .catch(err=>console.error(err));
*/


// ENV DEV

const mongoose = require("mongoose");   

mongoose.connect("mongodb://localhost:27017/aurafarma_db")
    .then(db=>console.log("DB is connected to", db.connection.host))
    .catch(err=>console.error(err));