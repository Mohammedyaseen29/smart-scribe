const express = require("express");
const cors = require("cors")
const app = express();
const calculator = require("./routes/calculator")


app.use(express.json());

app.use(cors());

app.use("/calculate",calculator);

app.get("/",(req,res)=>{
    res.send("Hello vro")
})

app.listen(3000,()=>{
    console.log("server is alive!!")
})