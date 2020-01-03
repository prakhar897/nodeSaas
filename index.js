var express = require("express");
var	app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var User = require('./models/user');
var bcrypt = require('bcrypt');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname+ "/public"));
app.use(expressSession({
	secret:"dadahdakhdadadada"
}));
app.use(passport.initialize());
app.use(passport.session());

var url = process.env.DATABASEURL;
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, function(email, password, next) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) return next(err);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return next('Email or password incorrect');
        }
        next(null, user);
    })
}));

passport.serializeUser(function(user,next){
	next(null,user._id); 
});

passport.deserializeUser(function(id,next){
	User.findById(id,function(err,user){
		next(err,user);
	});
});

app.get('/', function (req, res) {
  res.render('index' , {title: "Saas App"});
});

app.get('/main',function(req,res){
	res.render('main');
});

app.get('/login',function(req,res,next){
	res.render('login');
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/main');
    }
);

app.post('/signup',function (req,res,next){
	User.findOne({
		email:req.body.email
	},function(err,user){
		if(err) return next(err);
		if(user) return next("User already exists");
		let newUser = new User({
			email: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.password,10)
		});
		newUser.save(function(err){
			if(err) return next(err);
			res.redirect('/main');
		});
	});	
});

app.listen(process.env.PORT,function(req,res){
	console.log(`Listening on port ${process.env.PORT}`);
});