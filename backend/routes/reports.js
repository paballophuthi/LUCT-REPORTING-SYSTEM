const express = require('express');
const LectureReport = require('../models/LectureReport');
const { auth, requireRole } = require('../middleware/auth');
const { validateReport } = require('../middleware/validation');

const router = express.Router();

// Create report (Lecturer only)
router.post('/', auth, requireRole(['lecturer', 'prl', 'pl', 'fmg']), validateReport, async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      lecturer_id: req.user.id,
      lecturer_name: req.user.name
    };

    const report = await LectureReport.create(reportData);
    res.status(201).json({ 
      message: 'Report created successfully and sent for student approval', 
      report 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my reports (Lecturer)
router.get('/my-reports', auth, requireRole(['lecturer', 'prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const reports = await LectureReport.findByLecturer(req.user.id);
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reports (PRL, PL, FMG)
router.get('/', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const reports = await LectureReport.findAll();
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update report status (Student signature, PRL review)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, feedback_prl, feedback_pl } = req.body;
    
    const updateData = { status };
    if (feedback_prl !== undefined) updateData.feedback_prl = feedback_prl;
    if (feedback_pl !== undefined) updateData.feedback_pl = feedback_pl;
    
    const report = await LectureReport.updateStatus(req.params.id, updateData);
    res.json({ message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await LectureReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get report statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const query = `
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending_student_approval' THEN 1 END) as pending_approval,
        COUNT(CASE WHEN status = 'student_approved' THEN 1 END) as student_approved,
        COUNT(CASE WHEN status = 'prl_reviewed' THEN 1 END) as prl_reviewed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN faculty_name = 'FICT' THEN 1 END) as fict_reports,
        COUNT(CASE WHEN faculty_name = 'FBMG' THEN 1 END) as fbmg_reports,
        COUNT(CASE WHEN faculty_name = 'FABE' THEN 1 END) as fabe_reports,
        AVG(students_present::FLOAT / total_students * 100) as avg_attendance_rate
      FROM lecture_reports
    `;
    const result = await pool.query(query);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ error: 'Internal server error while fetching report statistics' });
  }
});

// Get reports by faculty
router.get('/faculty/:faculty', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const { faculty } = req.params;
    const { pool } = require('../config/database');
    
    const query = `
      SELECT * FROM lecture_reports 
      WHERE faculty_name = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [faculty]);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports by faculty error:', error);
    res.status(500).json({ error: 'Internal server error while fetching faculty reports' });
  }
});

// Search reports
router.get('/search/:query', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const { query } = req.params;
    const { pool } = require('../config/database');
    
    const searchQuery = `
      SELECT * FROM lecture_reports 
      WHERE 
        course_name ILIKE $1 OR 
        course_code ILIKE $1 OR 
        lecturer_name ILIKE $1 OR 
        class_name ILIKE $1 OR
        topic_taught ILIKE $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(searchQuery, [`%${query}%`]);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Search reports error:', error);
    res.status(500).json({ error: 'Internal server error while searching reports' });
  }
});

module.exports = router;