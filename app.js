var express           = require("express"),
    override          = require("method-override"),
    request           = require("request"),
    mongoose          = require("mongoose"),
    bodyParser        = require("body-parser"),
    expressSanitizer  = require("express-sanitizer"),
    passport          = require("passport"),
    flash             = require("connect-flash"),
    List              = require("./models/list")
    Task              = require("./models/task"),
    app               = express();

mongoose.connect("mongodb+srv://admin:pass@udemy-rxyvm.azure.mongodb.net/task_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(override("_method"));
app.use(flash());

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
      console.log(list);
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

app.listen(3000, function(){
  console.log("Server listening on PORT 3000..");
});
