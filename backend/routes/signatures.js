const express = require('express');
const StudentSignature = require('../models/StudentSignature');
const LectureReport = require('../models/LectureReport');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Add student signature
router.post('/', auth, requireRole(['student']), async (req, res) => {
  try {
    const { report_id, signature_data } = req.body;

    // Check if already signed
    const existingSignature = await StudentSignature.findByStudentAndReport(req.user.id, report_id);
    if (existingSignature) {
      return res.status(400).json({ error: 'You have already signed this report' });
    }

    const signature = await StudentSignature.create({
      report_id,
      student_id: req.user.id,
      signature_data
    });

    // Update report status
    await LectureReport.updateStatus(report_id, 'student_approved');

    res.status(201).json({
      message: 'Signature added successfully and report approved',
      signature
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get signatures for a report
router.get('/report/:reportId', auth, async (req, res) => {
  try {
    const signatures = await StudentSignature.findByReport(req.params.reportId);
    res.json({ signatures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;