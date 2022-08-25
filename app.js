const express = require("express");
const app = express();
const port = 3000;

app.listen(3000, () => {
    console.log("Server is up! Port: 3000");
});

app.get("/", (req, res) => {
    res(__dirname + "/index.html");
});