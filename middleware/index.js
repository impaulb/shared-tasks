var User  = require("../models/user"),
    List  = require("../models/list"),
    Task  = require("../models/task");
    flash = require("connect-flash");

var middlewareObj = {};

// Check if user is authenticated for list
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
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/");
  }
}

// Check if user is the correct user
middlewareObj.checkCorrectUser = function(req, res, next){
  if(req.isAuthenticated()){
    if(req.params.username === req.user.username){
      next();
    } else {
      req.flash("error", "You do not have access to do that.");
      res.redirect("/");
    }
  } else {
    req.flash("error", "You must be logged in to do that.");
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

// Create a list
middlewareObj.createList = function(listData, user){
  List.create(listData, function(err, list){
    if(err){
      console.log(err);
    } else {
      user.owns.push(list._id);
      user.hasAccess.push(list._id);
      user.save();
    }
  });
}

module.exports = middlewareObj;
