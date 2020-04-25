var express     = require("express"),
    router      = express.Router(),
    passport  = require("passport"),
    User        = require("../models/user"),
    middleware  = require("../middleware");

// Authentication routes
router.post("/authenticate", function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username}, function(err, user){
    if(!user){
      User.register({username: username}, password, function(err, user){
        if(err){
          console.log(err);
          req.flash("error", err.message);
          res.render("auth");
        } else {
          passport.authenticate("local")(req, res, function(){
            var listData = {
              title: "My List 1",
              tasks: [],
              ownedBy: req.user.username,
              hasAccess: [req.user.username]
            }
            middleware.createList(listData, user);
            req.flash("success", "You have been registered. Welcome, " + user.username + "!");
            res.redirect("/user/" + user.username);
          });
        }
      });
    } else {
      passport.authenticate('local', function(err, user, info) {
        if(err){
          req.flash("error", "No username was given.");
          res.render("auth");
        }
        if (!user){
          req.flash("error", "The credentials don't match.");
          res.render("auth");
        }
        req.logIn(user, function(err) {
          if(err){
            console.log(err);
          }
          req.flash("success", "You were successfully logged in.");
          res.redirect("/user/" + user.username);
        });
      })(req, res, next);
    }
  });
});

module.exports = router;
//
