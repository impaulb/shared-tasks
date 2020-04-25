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

var userRoutes        = require("./routes/user"),
    listRoutes        = require("./routes/list"),
    authRoutes        = require("./routes/auth"),
    indexRoutes       = require("./routes/index");

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

// ROUTING CONFIGURATION
app.use("/user", userRoutes);
app.use("/list", listRoutes);
app.use(authRoutes);
app.use(indexRoutes);
//

// Starting the server
app.listen(process.env.PORT || 3000, function(){
  console.log("Server listening on PORT 3000..");
});
//
