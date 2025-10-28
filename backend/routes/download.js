const express = require('express');
const ExcelGenerator = require('../utils/excelGenerator');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Download reports as Excel
router.get('/reports', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const query = 'SELECT * FROM lecture_reports ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    const excelBuffer = ExcelGenerator.generateReportsExcel(result.rows);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=lecture-reports.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Download reports error:', error);
    res.status(500).json({ error: 'Internal server error while generating Excel file' });
  }
});

// Download complaints as Excel
router.get('/complaints', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    const excelBuffer = ExcelGenerator.generateComplaintsExcel(result.rows);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Download complaints error:', error);
    res.status(500).json({ error: 'Internal server error while generating Excel file' });
  }
});

// Download user data
router.get('/my-data', auth, async (req, res) => {
  try {
    const userData = {
      user: req.user,
      reports: [],
      complaints: [],
      ratings: []
    };

    // Get user's reports if they are a lecturer
    if (['lecturer', 'prl', 'pl', 'fmg'].includes(req.user.role)) {
      const reportsResult = await pool.query(
        'SELECT * FROM lecture_reports WHERE lecturer_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      userData.reports = reportsResult.rows;
    }

    // Get user's complaints
    const complaintsResult = await pool.query(
      'SELECT * FROM complaints WHERE complainant_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    userData.complaints = complaintsResult.rows;

    // Get user's ratings
    const ratingsResult = await pool.query(
      'SELECT * FROM ratings WHERE rater_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    userData.ratings = ratingsResult.rows;

    res.json({
      message: 'User data retrieved successfully',
      data: userData,
      downloaded_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Download user data error:', error);
    res.status(500).json({ error: 'Internal server error while retrieving user data' });
  }
});

module.exports = router;