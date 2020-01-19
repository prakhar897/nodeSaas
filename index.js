var express = require("express");
var	app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var User = require('./models/user');
var bcrypt = require('bcrypt');
var expressSession = require('express-session');



dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname+ "/public"));
app.use(expressSession({
	secret: "Big secret",
	resave: false,
	saveUninitialized:false 
}));


var url = process.env.DATABASEURL;
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });












var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use('local',new LocalStrategy({
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

passport.use('signup-local',new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, function(email, password, next) {
    User.findOne({
		email:email
	},function(err,user){
		if(err) return next(err);
		if(user) return next("User already exists");
		let newUser = new User({
			email: email,
			passwordHash: bcrypt.hashSync(password,10)
		});
		newUser.save(function(err){
			next(err,newUser);
		});
	});
}));

passport.serializeUser(function(user,next){
	next(null,user._id); 
});

passport.deserializeUser(function(id,next){
	User.findById(id,function(err,user){
		next(err,user);
	});
});











const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);











app.get('/', function (req, res) {
  res.render('index' , {title: "Saas App"});
});

app.get('/main',function(req,res){
	res.render('main');
});

app.get('/login',function(req,res,next){
	res.render('login');
});

app.get('/billing',function(req,res,next){
    /*stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        subscription_data: {
          items: [{
            plan: 'prod_GUVGzI4HskJGNu',
          }],
        },
        success_url: 'http://localhost:3000/billing?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/billing',
        },function(err,session){
            if(err) next(err);
           // console.log(session);
            res.render('billing',{sessionId:session.id});
        }
    );*/

    res.render('billing',{sessionId:0});
});

app.get('/logout',function(req,res,next){
    req.logout();
    res.redirect('/');
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/main');
    }
);

app.post('/signup',
    passport.authenticate('signup-local', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/main');
    }
);


app.listen(process.env.PORT,function(req,res){
	console.log(`Listening on port ${process.env.PORT}`);
});