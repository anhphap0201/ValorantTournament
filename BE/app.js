const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
function logger(req, res, next){
    console.log(req.url);
    next();
}
app.use(logger);
function checkUsername(req,res,next){
    if(req.body.username === "dkadmin"){
        next();
        return;
    }

    res.send("Username is not valid");
    
}

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.post("/login",checkUsername, (req, res) => {
    try {
        console.log(req.body);
        res.status(200).send("Login success");
    } catch (error) {
        console.log(error);
        res.status(400).send("Login failed");
    }
})



app.listen(3000, () => {
    console.log("Server started on port 3000");
});