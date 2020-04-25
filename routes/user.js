var express     = require("express"),
    router      = express.Router(),
    List        = require("../models/list"),
    middleware  = require("../middleware");

// User routes
router.get("/:username", middleware.checkCorrectUser, function(req, res){
  List.find({hasAccess: req.user.username}, function(err, lists){
    res.render("user", {lists: lists});
  });
});

router.post("/:username/addList", middleware.checkCorrectUser, function(req, res){
  var listData = {
    title: "My List " + (req.user.owns.length + 1),
    tasks: [],
    ownedBy: req.user.username,
    hasAccess: [req.user.username]
  }
  middleware.createList(listData, req.user);
  req.flash("success", "Your list \"" + listData.title + "\" has been created.");
  res.redirect("/user/" + req.user.username);
});

module.exports = router;
//
