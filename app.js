//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

 
mongoose.connect("mongodb+srv://rajeshpareekdevo:ZtFXTVFswLyOCwxn@cluster0.olrsf8b.mongodb.net/userDB",{useNewUrlparser:true});


const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  secret:String
});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

var userid="";

app.post("/register", function(req, res){

  userid=req.body.username;

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    var newUser =User({
      email: req.body.username,
      password: hash
    });
    newUser.save().then(function(){
      res.redirect("/secrets");
    }).catch(function(err){
      console.log("Here I got eroor",err);
    });
  });

});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  
  User.findOne({email:username}).then(function(foundUser){
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, function(err, result) {
        if (result === true) {
          res.redirect("/secrets");
        }
      });
    }
    else{
      res.send("unauthorised");
    }
  }).catch(function(err){
    res.send("unauthorised");
    console.log(err);
  });
});

app.get("/warning", function (req, res) {
  res.render("warning");
})

app.get("/submit", function(req, res){
    res.render("submit");
});

app.post("/submit", function(req, res){

  const submittedSecret = req.body.secret;
 console.log(submittedSecret);
  User.findOne({email:userid}).then(function(foundUser){
    console.log("in here");
      foundUser.secret = submittedSecret;

      foundUser.save().then(function(){
        console.log("in save");
        res.redirect("/secrets");
      }).catch(function(err){
        console.log(err);
      })    

  }).catch(function(err){
    console.log(err);
  });
  
});

app.get("/logout", function(req, res){
  res.redirect("/");
});

app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}).then(function(foundUsers){
    if (foundUsers) {
      res.render("secrets", {usersWithSecrets: foundUsers});
    }
  }).catch(function(err){
    console.log(err);
  });    
  
});


app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000.");
});