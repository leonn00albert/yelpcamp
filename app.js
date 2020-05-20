const express = require('express');
var flash = require('connect-flash')
var passport =require('passport');
const  bodyParser = require('body-parser');
var Campground = require("./models/campgrounds");
var User = require("./models/users")
var localStrategy = require('passport-local');
var methodOverride = require('method-override');
var passportLocalMongoose = require('passport-local-mongoose');
var mongoose =require('mongoose');
var seedDB = require('./seeds')
var Comment   = require("./models/comment");
var middleware = require("./middleware/index")
var campgroundRoutes   = require("./routes/campgrounds");
var commentRoutes   = require("./routes/comments");
var authRoutes   = require("./routes/index");
const app = express();

mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true,  useUnifiedTopology : true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(methodOverride("_method"));
app.use(flash());

app.use(express.static(__dirname + "/public"))

// passport setup

app.use(require("express-session")({
	secret: "frank the cat is awesome",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use(function(req, res , next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
	next();
})

//seedDB()  seed db


app.use(authRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);



//edit routes






app.listen(3000, function(){
	console.log("The Yelpcamp server has started");
});
