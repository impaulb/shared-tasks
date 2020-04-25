var express     = require("express"),
    router      = express.Router(),
    List        = require("../models/list"),
    User        = require("../models/user"),
    Task        = require("../models/task"),
    middleware  = require("../middleware");

// List routes
router.get("/:id", middleware.checkListOwnership, function(req, res){
  List.findOne({_id: req.params.id}, function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.find({belongsTo: list._id}, function(err, tasks){
        if(err){
          console.log(err);
        } else {
          res.render("list", {tasks: tasks, list: list});
        }
      });
    }
  });
});

router.delete("/:id", middleware.checkListOwnership, function(req, res){
  List.findOneAndDelete({_id: req.params.id}, function(err){
    if(err){
      console.log(err);
    } else {
      Task.deleteMany({belongsTo: req.params.id}, function(err){
        if(err){
          console.log(err);
          list.tasks = [];
          list.save();
        } else {
          User.findOne({username: req.user.username}, function(err, user){
            if(err){
              console.log(err);
            } else {
              user.owns.splice(user.owns.indexOf(req.params.id), 1);
              user.hasAccess.splice(user.hasAccess.indexOf(req.params.id), 1);
              user.save();
            }
          });
        }
      });
    }
    req.flash("success", "List has been deleted.");
    res.redirect("/user/" + req.user.username);
  });
});

router.put("/:id", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      list.title = req.body.title;
      list.save();
      req.flash("success", "The title has been updated to: \"" + list.title + "\".");
    }
    res.redirect("back");
  });
});

router.put("/:id/addTask", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      if(req.body.new.length > 0){
        newTask = {
          belongsTo: req.params.id,
          content: req.body.new
        }
        Task.create(newTask, function(err, task){
          if(err){
            console.log(err);
          } else {
            list.tasks.push(task);
            list.save();
          }
        });
      } else {
        req.flash("error", "The task can not be blank.")
      }
    }
    res.redirect("back");
  });
});

router.delete("/:id/deleteTask", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.findOneAndRemove({_id: req.body.taskId}, function(err){
        if(err){
          console.log(err);
        } else {
          list.tasks.splice(list.tasks.indexOf(req.body.taskId), 1);
          list.save();
        }
      });
    }
    res.redirect("back");
  });
});

router.put("/:id/addUser", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      User.findOne({username: req.body.username}, function(err, user){
        if(err || user === null || list.hasAccess.includes(user.username)){
          console.log(err);
          req.flash("error", "This user does not exist or has been added already.");
        } else {
          list.hasAccess.push(user.username);
          list.save();
          user.hasAccess.push(list._id);
          user.save();
          req.flash("success", user.username + " has been granted access.");
        }
      });
    }
    res.redirect("back");
  });
});

router.delete("/:id/deleteUser", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      User.findOne({username: req.body.user}, function(err, user){
        if(err){
          console.log(err);
        } else {
          list.hasAccess.splice(list.hasAccess.indexOf(req.body.user), 1);
          list.save();
          user.hasAccess.splice(user.hasAccess.indexOf(req.params.id), 1);
          user.save();
          req.flash("success", req.body.user + "'s access has been revoked.");
        }
      });
    }
    res.redirect("back");
  });
});

module.exports = router;
//
