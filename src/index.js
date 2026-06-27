const express = require("express");

//generar app web
const app = express();

app.get("/", (req, res) => {
    res.send("Sistemas Operativos desde NodeJS 67");
});


//Conexxion con la base de datos
require("./database.js");

app.use(express.json());

app.use(require("./routes/index.routes.js"));

app.use(require("./userModel.js"));

//Definimos el puerto del servicio web
app.listen(3000);




console.log("Server en el puerto 3000")

