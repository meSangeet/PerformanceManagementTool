const express = require('express');
const multer = require('multer');
const { parseCSV } = require('../utils/csvUtils');
const Student = require('../models/student');
const UploadLog = require('../models/uploadLog');
const authMiddleware = require('../utils/authMiddleware');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload CSV
router.post('/upload', [authMiddleware, upload.single('file')], async (req, res) => {
    try {
        const filePath = req.file.path;
        parseCSV(filePath, async (err, data) => {
            if (err) return res.status(500).json({ msg: 'Error processing file' });

            const promises = data.map(async (row) => {
                const student = new Student({
                    studentID: row.studentID,
                    studentName: row.studentName,
                    class: row.class,
                    examName: row.examName,
                    subject: row.subject,
                    score: row.score
                });
                await student.save();
            });

            await Promise.all(promises);

            // Log the upload
            const uploadLog = new UploadLog({
                fileID: req.file.filename,
                uploadedBy: req.user.id,
                fileName: req.file.originalname,
                status: 'successful'
            });
            await uploadLog.save();

            res.status(200).json({ msg: 'File processed successfully' });
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Fetch student data
router.get('/', authMiddleware, async (req, res) => {
    const { studentID, class: studentClass, examName } = req.query;
    try {
        const query = {};
        if (studentID) query.studentID = studentID;
        if (studentClass) query.class = studentClass;
        if (examName) query.examName = examName;

        const students = await Student.find(query);
        res.json(students);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Performance Analytics
router.post('/analyze', authMiddleware, async (req, res) => {
    const { class: studentClass, examName, subject } = req.body;
    try {
        const students = await Student.find({ class: studentClass, examName, subject });

        if (students.length === 0) return res.status(404).json({ msg: 'No data found' });

        const scores = students.map(student => student.score);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        res.json({ average, highest, lowest });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Class-wise Performance Analysis
router.post('/class-analysis', authMiddleware, async (req, res) => {
    try {
        const { examName, subject } = req.body;

        const classes = await Student.distinct('class');
        const results = await Promise.all(classes.map(async (className) => {
            const students = await Student.find({ class: className, examName, subject });
            const scores = students.map(student => student.score);
            const average = scores.reduce((a, b) => a + b, 0) / scores.length;
            return {
                className,
                average,
                highest: Math.max(...scores),
                lowest: Math.min(...scores),
                numberOfStudents: students.length
            };
        }));

        results.sort((a, b) => b.average - a.average);

        res.json(results);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// School-wide Analysis
router.post('/school-analysis', authMiddleware, async (req, res) => {
    try {
        const { examName, subject } = req.body;

        const students = await Student.find({ examName, subject });
        if (students.length === 0) return res.status(404).json({ msg: 'No data found' });

        const scores = students.map(student => student.score);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        const totalPassed = students.filter(student => student.score >= 50).length;
        const totalFailed = students.length - totalPassed;

        const bestPerformer = students.reduce((best, student) => student.score > best.score ? student : best, students[0]);

        res.json({
            average,
            highest,
            lowest,
            totalPassed,
            totalFailed,
            bestPerformer
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Performance Statistics
router.post('/performance-statistics', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.body;

        const students = await Student.find({ subject });
        if (students.length === 0) return res.status(404).json({ msg: 'No data found' });

        const totalStudents = students.length;
        const totalPassed = students.filter(student => student.score >= 50).length;
        const totalFailed = totalStudents - totalPassed;

        const bestPerformer = students.reduce((best, student) => student.score > best.score ? student : best, students[0]);
        const worstPerformer = students.reduce((worst, student) => student.score < worst.score ? student : worst, students[0]);

        res.json({
            totalStudents,
            totalPassed,
            totalFailed,
            bestPerformer,
            worstPerformer
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
