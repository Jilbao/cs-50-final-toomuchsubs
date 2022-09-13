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
    if (req.isAuthenticated()) {
        res.render("dashboard");
    }else{
        res.render("home");
    };
    
});

//Error
app.get("/error", (req, res) => {
    res.render("error", {failureMessage: "Incorrect password or username"});
});

//Dashboard
app.get("/dashboard", (req, res) => {
    
    User.findById(req.user._id, (err, foundUser) => {
        if (!err) {
            console.log(foundUser.username);
            res.render("dashboard", {username: foundUser.username});
        }else{
            res.redirect("/login");
        }
    });
});

//Login
app.route("/login")
   .get((req, res)=>{
        res.render("login");
   })
   .post(passport.authenticate("local", { failureRedirect: "/error"}),
   (req, res)=>{
        
        res.redirect("/dashboard");
   });


//Register

app.route("/register")
   .get((req, res)=>{
        res.render("register");
   })
   .post((req, res)=>{
        User.findOne({username: req.body.username}, (err,foundUser) => {
            if (err) {
                confirm.log(err);
            }else{
                if (foundUser){
                    res.render("error", {failureMessage: "Username already exist!"});
                }else{
                    if (req.body.password === req.body.confirmation){
                        User.register({username: req.body.username}, req.body.password, (err, user)=>{
                            if (err) {
                                console.log(err);
                                res.redirect("/register");
                            } else {
                                passport.authenticate("local")(req, res, ()=>{
                                    res.redirect("/login");
                                });
                            }
                        });
                    } else {
                        res.render("error", {failureMessage: "Password doesn't match!"});
                    };     
                };
            };
        });      
   });

//Logout
app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
    
});


//Listen
app.listen(port, () => {
    console.log("Server is up! Port: 3000");
});