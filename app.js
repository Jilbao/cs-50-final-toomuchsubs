//Requiries
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//App Setup
const app = express();
const port = 3000;

//Static
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//Session
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
}))

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Database
mongoose.connect(process.env.DB_URL);

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
})
UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model("user", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//Index
app.get("/", (req, res) => {
    res.render("home");
});

//Login
app.route("/login")
   .get((req, res)=>{
        res.render("login");
   })
   .post((req, res)=>{

   })


//Register

app.route("/register")
   .get((req, res)=>{
        res.render("register");
   })
   .post((req, res)=>{

   });



//Listen
app.listen(port, () => {
    console.log("Server is up! Port: 3000");
});