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

mongoose.set("useCreateIndex", true); 


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}


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

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser =  new User({
      email: req.body.username,
      password: hash
    });
    newUser.save().then(function(result){
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

  User.findOne({email:req.body.username}).then(function(foundUser){
    if (foundUser) {
      foundUser.secret = submittedSecret;
      foundUser.save().then(function(){
        res.redirect("/secrets");
      }).catch(function(err){
        console.log(err);
      })    
    }
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



connectDB().then(() => {
  app.listen(process.env.PORT||3000, () => {
      console.log("listening for requests");
  })
})