const express = require("express");
const {analyzeImage} = require("../utils/analyzeImage")
const calRouter = express.Router();


calRouter.post("/",async(req,res)=>{
    const { image, dict_of_vars } = req.body;
    if (!image) {
        return res.status(400).json({ error: "Image data is required" });
    }
    const img = image.split(",")[1];
    try {
        const result = await analyzeImage(img,dict_of_vars);
        res.json({message:"Image is processed",data:result,status:"success"})
    } catch (error) {
        console.log(error);
        res.status(400).json({error:error})
    }
})

module.exports = calRouter;