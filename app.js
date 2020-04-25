var express           = require("express"),
    override          = require("method-override"),
    request           = require("request"),
    mongoose          = require("mongoose"),
    bodyParser        = require("body-parser"),
    expressSanitizer  = require("express-sanitizer"),
    passport          = require("passport"),
    flash             = require("connect-flash"),
    middleware        = require("./middleware"),
    LocalStrategy     = require("passport-local"),
    List              = require("./models/list"),
    Task              = require("./models/task"),
    User              = require("./models/user"),
    app               = express();

mongoose.connect("mongodb+srv://admin:pass@udemy-rxyvm.azure.mongodb.net/task_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// APP CONFIGURATION
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(override("_method"));
app.use(flash());
//

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "1234567890",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//

function createList(listData, user){
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

app.get("/", function(req, res){
  if(req.user){
    res.redirect("/user/" + req.user.username);
  } else {
    res.render("initial");
  }
});

app.get("/user/:username", middleware.checkCorrectUser, function(req, res){
  List.find({hasAccess: req.user.username}, function(err, lists){
    res.render("user", {lists: lists});
  });
});

app.post("/user/:username/addList", middleware.checkCorrectUser, function(req, res){
  var listData = {
    title: "My List " + (req.user.owns.length + 1),
    tasks: [],
    ownedBy: req.user.username,
    hasAccess: [req.user.username]
  }
  createList(listData, req.user);
  req.flash("success", "Your list \"" + listData.title + "\" has been created.");
  res.redirect("/user/" + req.user.username);
});

app.get("/list/:id", middleware.checkListOwnership, function(req, res){
  List.findOne({_id: req.params.id}, function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.find({belongsTo: list._id}, function(err, tasks){
        if(err){
          console.log(err);
        } else {
          res.render("", {tasks: tasks, list: list});
        }
      });
    }
  });
});

app.put("/list/:id/addTask", middleware.checkListOwnership, function(req, res){
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
            res.redirect("/list/" + req.params.id);
          }
        });
      } else {
        req.flash("error", "The task can not be blank.")
        res.redirect("/list/" + req.params.id);
      }
    }
  });
});

app.put("/list/:id/addUser", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      User.findOne({username: req.body.username}, function(err, user){
        if(err || user === null || list.hasAccess.includes(user.username)){
          console.log(err);
          req.flash("error", "This user does not exist or has been added already.");
          res.redirect("/list/" + req.params.id);
        } else {
          list.hasAccess.push(user.username);
          list.save();
          user.hasAccess.push(list._id);
          user.save();
          req.flash("success", user.username + " has been granted access.");
          res.redirect("/list/" + req.params.id);
        }
      });
    }
  });
});

app.delete("/list/:id/removeUser", middleware.checkListOwnership, function(req, res){
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
          res.redirect("back");
        }
      });
    }
  });
});

app.put("/list/:id/editTitle", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      list.title = req.body.title;
      list.save();
      req.flash("success", "The title has been updated to: \"" + list.title + "\".");
      res.redirect("/list/" + req.params.id);
    }
  });
});

app.delete("/list/:id/:taskId/delete", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.findOneAndRemove({_id: req.params.taskId}, function(err){
        if(err){
          console.log(err);
        } else {
          list.tasks.splice(list.tasks.indexOf(req.params.taskId), 1);
          list.save();
          res.redirect("/list/" + req.params.id);
        }
      });
    }
  });
});

app.delete("/list/:id/delete", middleware.checkListOwnership, function(req, res){
  List.findOneAndDelete({_id: req.params.id}, function(err){
    if(err){
      console.log(err);
    } else {
      Task.deleteMany({belongsTo: req.params.id}, function(err){
        if(err){
          console.log(err);
        } else {
          res.redirect("/user/" + req.user.username);
        }
      });
    }
  });
});

app.delete("/list/:id", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.deleteMany({belongsTo: list._id}, function(err){
        if(err){
          console.log(err);
        } else {
          list.tasks = [];
          list.save();
          res.redirect("/list/" + req.params.id);
        }
      });
    }
  });
});

app.post("/authenticate", function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username}, function(err, user){
    if(!user){
      User.register({username: username}, password, function(err, user){
        if(err){
          console.log(err);
          req.flash("error", err.message);
          res.redirect("/");
        } else {
          passport.authenticate("local")(req, res, function(){
            var listData = {
              title: "My List 1",
              tasks: [],
              ownedBy: req.user.username,
              hasAccess: [req.user.username]
            }
            createList(listData, user);
            req.flash("success", "You have been registered. Welcome, " + user.username + "!");
            res.redirect("/user/" + user.username);
          });
        }
      });
    } else {
      passport.authenticate('local', function(err, user, info) {
        if(err){
          req.flash("error", "No username was given.");
          res.redirect("/");
        }
        if (!user){
          req.flash("error", "The credentials don't match.");
          res.redirect("/");
        }
        req.logIn(user, function(err) {
          if(err){
            console.log(err);
          }
          res.redirect('/user/' + user.username);
        });
      })(req, res, next);
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "You were successfully logged out!");
  res.redirect("/");
});

app.get("*", function(req, res){
  req.flash("error", "This path doesn't exist!");
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server listening on PORT 3000..");
});
