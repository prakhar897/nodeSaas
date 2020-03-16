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
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized:false 
}));


var url = process.env.DATABASEURL;
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Match the raw body to content type application/json
app.post('/pay-success', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.ENDPOINT_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Fulfill the purchase...
        console.log(session);
        User.findOne({
            email: session.customer_email
        }, function(err, user) {
            if (user) {
                user.subscriptionActive = true;
                user.subscriptionId = session.subscription;
                user.customerId = session.customer;
                user.save();
            }
        });
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});


app.post('/cancel-sub' , (req,res)=>{
    User.findOne({
        _id:req.session.passport.user
    })
    .then((user) => {
        stripe.subscriptions.del(user.subscriptionId, (err,confirmation) => {
            if(err)
                console.log(err);
            else
                user.subscriptionActive = false;
                user.subscriptionId = null;
                user.customerId = null;
                user.save();
                res.redirect('/billing');
        });
    });
    
});



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




app.get('/', function (req, res) {
  res.render('index' , {title: "Saas App"});
});

app.get('/main',function(req,res){
	res.render('main');
});

app.get('/login',function(req,res,next){
	res.render('login');
});

app.get('/billing', function (req, res, next) {

    stripe.checkout.sessions.create({
        customer_email: req.user.email,
        payment_method_types: ['card'],
        subscription_data: {
            items: [{
                plan: process.env.STRIPE_PLAN,
            }],
        },
        success_url:process.env.BASE_URL + '/billing?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.BASE_URL + '/billing',
    }, function(err, session) {
        if (err) return next(err);
        res.render('billing', {STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY, sessionId: session.id, subscriptionActive: req.user.subscriptionActive})
    });
})

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