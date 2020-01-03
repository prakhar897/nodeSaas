var mongoose = require('mongoose');

module.exports = mongoose.model('user', new mongoose.Schema({
	email:String,
	passwordHash:String
}));
