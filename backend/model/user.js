var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	username: String,
	email: { type: String, required: true, unique: true },
	password: String
}),
user = mongoose.model('user', userSchema);

module.exports = user;