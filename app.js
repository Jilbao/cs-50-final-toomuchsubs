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
    subscriptions: [
        {
            subName: String,
            subStartDate: Date,
            subEndDate: Date,
            subFee: Number,
            subPaymentTool: String
        }
    ]
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
        res.redirect("/dashboard");
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
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, foundUser) => {
            if (!err) {
                
                res.render("dashboard", {username: foundUser.username, subscriptions: foundUser.subscriptions});
            }else{
                res.redirect("/login");
            }
        });
    }else{
        res.redirect("/");
    };
    
    
});
//Addsub
app.route("/addsub")
   .get((req, res)  => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, foundUser) => {
            if (!err) {
                
                res.render("addsub", {username: foundUser.username});
            }else{
                res.redirect("/login");
            }
        });
    }else{
        res.redirect("/");
    };
   })
   .post((req, res) => {
        const newSub = {
            subName: req.body.subName,
            subStartDate: req.body.subStartDate,
            subEndDate: req.body.subEndDate,
            subFee: req.body.subFee,
            subPaymentTool: req.body.subPaymentTool
        }
        if (req.isAuthenticated()) {
            User.findById(req.user.id, (err, foundUser) => {
                if (!err) {
                    foundUser.subscriptions.push(newSub);
                    foundUser.save(()=>{
                        res.redirect("/dashboard");
                    });                    
                }else{
                    res.redirect("/login");
                }
            });
        }else{
            res.redirect("/");
        };


   });
//Deletesub
app.post("/deletesub",(req, res)=>{

    if (req.isAuthenticated()) {
        User.findByIdAndUpdate(req.user.id, {"$pull" : {"subscriptions" : {"_id" : req.body._id}}},(err) => {
            if (!err) {
                res.redirect("/dashboard");
            }
        });
    }else{
        res.redirect("/");
    };
    

});
//Refreshsub
app.post("/refreshsub",(req, res)=>{
    
    if (req.isAuthenticated()) {
        const endDate = req.body.enddate.toLocaleString();
        var newDate = new Date(endDate);
        var newEndDate = newDate.setDate(newDate.getDate()+30);
        User.updateMany( {"_id": req.user.id ,"subscriptions._id" :req.body._id}, {"$set" : 
        {"subscriptions.$.subStartDate" : endDate, "subscriptions.$.subEndDate": newEndDate}},(err) => {
            if (!err) {
                res.redirect("/dashboard");
            };
        });
    }else{
        res.redirect("/");
    };
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