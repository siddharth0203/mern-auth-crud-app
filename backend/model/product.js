var mongoose = require('mongoose');
var Schema = mongoose.Schema;

courseSchema = new Schema( {
	name: String, // Course Name
	desc: String, // Description
	instructor: String, // Instructor Name
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date : { type : Date, default: Date.now }
}),
course = mongoose.model('course', courseSchema);

module.exports = course;