var express     = require("express"),
    router      = express.Router();

// Index routes
router.get("/", function(req, res){
  if(req.user){
    res.redirect("/user/" + req.user.username);
  } else {
    res.render("auth");
  }
});

router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "You were successfully logged out.");
  res.redirect("/");
});

router.get("*", function(req, res){
  req.flash("error", "This path doesn't exist!");
  res.redirect("back");
});

module.exports = router;
//
