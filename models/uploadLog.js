const mongoose = require('mongoose');

const UploadLogSchema = new mongoose.Schema({
    fileID: { type: String, required: true, unique: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    fileName: { type: String, required: true },
    status: { type: String, enum: ['successful', 'error'], required: true },
});

module.exports = mongoose.model('UploadLog', UploadLogSchema);
