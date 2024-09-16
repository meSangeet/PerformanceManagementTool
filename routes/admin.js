const express = require('express');
const UploadLog = require('../models/uploadLog');
const User = require('../models/user');
const authMiddleware = require('../utils/authMiddleware');
const router = express.Router();

// View upload logs
router.get('/logs', authMiddleware, async (req, res) => {
    try {
        const logs = await UploadLog.find().populate('uploadedBy', 'name email');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get list of teachers
router.get('/teachers', authMiddleware, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
