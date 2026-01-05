var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true }, // Course Name
  desc: { type: String, required: true }, // Description
  instructor: { type: String, required: true }, // Instructor Name
  user_id: { type: Schema.ObjectId, required: true }, // User ID
  is_delete: { type: Boolean, default: false },
  date: { type: Date, default: Date.now } // Creation Date
});

const course = mongoose.models.course || mongoose.model('course', courseSchema);

module.exports = course;