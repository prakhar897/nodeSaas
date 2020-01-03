var express = require("express");
var	app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var User = require('./models/user');
var bcrypt = require('bcrypt');

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname+ "/public"));

var url = process.env.DATABASEURL;
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', function (req, res) {
  res.render('index' , {title: "Saas App"});
});

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
		newUser.save();
	});	
});

app.listen(process.env.PORT,function(req,res){
	console.log(`Listening on port ${process.env.PORT}`);
});