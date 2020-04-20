var express           = require("express"),
    override          = require("method-override"),
    request           = require("request"),
    mongoose          = require("mongoose"),
    bodyParser        = require("body-parser"),
    expressSanitizer  = require("express-sanitizer"),
    passport          = require("passport"),
    flash             = require("connect-flash"),
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

app.get("/", function(req, res){
  res.redirect("list");
});

app.get("/list", function(req, res){
  List.findById("5e9cbf721c9d4400000c4a1c", function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.find({belongsTo: list._id}, function(err, tasks){
        if(err){
          console.log(err);
        } else {
          res.render("", {tasks: tasks});
        }
      });
    }
  });
});

app.put("/list/add", function(req, res){
  List.findById("5e9cbf721c9d4400000c4a1c", function(err, list){
    if(err){
      console.log(err);
    } else {
      newTask = {
        belongsTo: list._id,
        content: req.body.new
      }
      Task.create(newTask, function(err, task){
        if(err){
          console.log(err);
        } else {
          list.tasks.push(task);
          list.save();
          res.redirect("/");
        }
      });
    }
  });
});

app.delete("/list/:id/delete", function(req, res){
  List.findById("5e9cbf721c9d4400000c4a1c", function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.deleteOne({_id: req.params.id}, function(err){
        if(err){
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    }
  });
});

app.delete("/list", function(req, res){
  List.findById("5e9cbf721c9d4400000c4a1c", function(err, list){
    if(err){
      console.log(err);
    } else {
      Task.deleteMany({belongsTo: "5e9cbf721c9d4400000c4a1c"}, function(err){
        if(err){
          console.log(err);
        } else {
          list.tasks = [];
          list.save();
          res.redirect("/");
        }
      });
    }
  });
});

app.get("/signin", function(req, res){
  res.render("signin");
});

app.post("/signin", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/signin",
  failureFlash: true,
  successFlash: true
}), function(req, res){
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.post("/signup", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      req.flash("error", err.message);
      res.render("signup");
    } else {
      passport.authenticate("local")(req, res, function(){
          req.flash("success", "You have been registered. Welcome, " + user.username + "!");
          res.redirect("/");
      });
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "You were successfully logged out!");
  res.redirect("/");
});

app.listen(3000, function(){
  console.log("Server listening on PORT 3000..");
});
