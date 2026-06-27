const {Router} = require("express")

const router = Router()

const ModelUser = require("../userModel.js");

router.get("/home",(req, res)=>{
    res.send("Bien venidos ")
});

// CRUD

router.get("/listar", async(req, res)=>{
    const respuesta = await ModelUser.find({});
    res.send(respuesta);
});

router.post("/", async(req,res)=>{
    const body = req.body;
    const resp = await ModelUser.create(body);
    res.send(resp);
});

router.put("/:id", async(req, res)=>{
    const id = req.params.id;
    const body = req.body;
    const resp = await ModelUser.findByIdAndUpdate(id,body,{new:true});
    res.send(resp);

});

router.delete("/:id", async(req, res)=>{
    const id = req.params.id;
    const body = req.body;
    const resp = await ModelUser.findByIdAndDelete(id);
    res.send(resp);

});

module.exports = router;