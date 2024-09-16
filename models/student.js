const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentID: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    examName: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    dateUploaded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', StudentSchema);
