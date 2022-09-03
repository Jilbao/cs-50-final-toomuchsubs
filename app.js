//Requiries
const express = require("express");
const app = express();
const port = 3000;
//EJS
const ejs = require("ejs");

//Static
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//Listen
app.listen(port, () => {
    console.log("Server is up! Port: 3000");
});

//Index
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

//Login
app.get("/login", (req, res) => { 
    res.sendFile(__dirname + "/login.html");
});

//Register
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/register.html");
});