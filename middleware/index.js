var User  = require("../models/user"),
    List  = require("../models/list"),
    Task  = require("../models/task");
    flash = require("connect-flash");

var middlewareObj = {};

// Check if user is authenticated for blog
middlewareObj.checkListOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    List.findOne({ownedBy: req.params.id}, function(err, list){
      if(err){
        req.flash("error", "You don't have permission to do that.");
        res.redirect("back");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/");
  }
}

// Check if user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/");
  }
}

module.exports = middlewareObj;
