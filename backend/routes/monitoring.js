const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get comprehensive system statistics
router.get('/stats', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    // Fetch multiple statistics in parallel
    const [
      userStats,
      reportStats,
      complaintStats,
      courseStats,
      classStats,
      facultyStats
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
          COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as total_lecturers,
          COUNT(CASE WHEN role = 'prl' THEN 1 END) as total_prls,
          COUNT(CASE WHEN role = 'pl' THEN 1 END) as total_pls,
          COUNT(CASE WHEN role = 'fmg' THEN 1 END) as total_fmg,
          COUNT(CASE WHEN is_approved = false AND role = 'student' THEN 1 END) as pending_approvals
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN status = 'pending_student_approval' THEN 1 END) as pending_approval,
          COUNT(CASE WHEN status = 'student_approved' THEN 1 END) as student_approved,
          COUNT(CASE WHEN status = 'prl_reviewed' THEN 1 END) as prl_reviewed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          AVG(students_present::FLOAT / total_students * 100) as avg_attendance_rate
        FROM lecture_reports
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_complaints,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_complaints,
          COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review_complaints,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints,
          COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_complaints,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_complaints
        FROM complaints
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_courses,
          COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_courses,
          COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_courses,
          COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_courses
        FROM courses
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_classes,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_classes,
          COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_classes,
          COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_classes,
          COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_classes,
          SUM(total_students) as total_students_enrolled
        FROM classes
      `),
      pool.query(`
        SELECT 
          faculty,
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as lecturers,
          COUNT(CASE WHEN role = 'prl' THEN 1 END) as prls,
          COUNT(CASE WHEN role = 'pl' THEN 1 END) as pls
        FROM users 
        GROUP BY faculty
        ORDER BY faculty
      `)
    ]);

    // Get recent activity
    const [recentReports, recentComplaints, systemLogs] = await Promise.all([
      pool.query(`
        SELECT lr.*, u.name as lecturer_full_name 
        FROM lecture_reports lr
        LEFT JOIN users u ON lr.lecturer_id = u.id
        ORDER BY lr.created_at DESC 
        LIMIT 10
      `),
      pool.query(`
        SELECT c.*, u.name as complainant_name, against.name as against_user_name
        FROM complaints c 
        LEFT JOIN users u ON c.complainant_id = u.id 
        LEFT JOIN users against ON c.against_user_id = against.id
        ORDER BY c.created_at DESC 
        LIMIT 10
      `),
      pool.query(`
        SELECT sl.*, u.name as user_name 
        FROM system_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        ORDER BY sl.created_at DESC 
        LIMIT 20
      `)
    ]);

    res.json({
      userStats: userStats.rows[0],
      reportStats: reportStats.rows[0],
      complaintStats: complaintStats.rows[0],
      courseStats: courseStats.rows[0],
      classStats: classStats.rows[0],
      facultyStats: facultyStats.rows,
      recentActivity: {
        reports: recentReports.rows,
        complaints: recentComplaints.rows,
        systemLogs: systemLogs.rows
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get monitoring stats error:', error);
    res.status(500).json({ error: 'Internal server error while fetching monitoring data' });
  }
});

// Get faculty-specific statistics
router.get('/stats/faculty/:faculty', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const { faculty } = req.params;
    
    const facultyStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM lecture_reports WHERE faculty_name = $1) as total_reports,
        (SELECT COUNT(*) FROM lecture_reports WHERE faculty_name = $1 AND status = 'pending_student_approval') as pending_approval,
        (SELECT COUNT(*) FROM lecture_reports WHERE faculty_name = $1 AND status = 'student_approved') as student_approved,
        (SELECT COUNT(*) FROM lecture_reports WHERE faculty_name = $1 AND status = 'completed') as completed,
        (SELECT COUNT(*) FROM users WHERE faculty = $1 AND role = 'lecturer') as total_lecturers,
        (SELECT COUNT(*) FROM users WHERE faculty = $1 AND role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE faculty = $1 AND role = 'prl') as total_prls,
        (SELECT COUNT(*) FROM users WHERE faculty = $1 AND role = 'pl') as total_pls,
        (SELECT COUNT(*) FROM complaints c JOIN users u ON c.complainant_id = u.id WHERE u.faculty = $1) as total_complaints,
        (SELECT COUNT(*) FROM courses WHERE faculty = $1) as total_courses,
        (SELECT COUNT(*) FROM classes WHERE faculty = $1) as total_classes
    `;
    
    const result = await pool.query(facultyStatsQuery, [faculty]);
    res.json({ stats: result.rows[0], faculty });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ error: 'Internal server error while fetching faculty stats' });
  }
});

// Get system health status
router.get('/health', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT 1 as test');
    const dbStatus = dbTest.rows.length > 0 ? 'healthy' : 'unhealthy';
    
    // Get server information
    const serverInfo = {
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      database_connection: dbStatus,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      status: 'operational',
      server: serverInfo,
      components: {
        database: dbStatus,
        authentication: 'operational',
        file_system: 'operational',
        email_service: 'not_configured'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'degraded',
      error: 'System health check failed',
      database_connection: 'unhealthy'
    });
  }
});

module.exports = router;