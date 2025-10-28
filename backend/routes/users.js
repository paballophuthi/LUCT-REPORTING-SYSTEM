const express = require('express');
const UserController = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// ==================== PUBLIC ROUTES (No authentication required) ====================

// Get public system statistics
router.get('/public/stats', async (req, res) => {
  try {
    console.log('Fetching public stats...');
    
    const queries = [
      // Total faculties
      pool.query('SELECT COUNT(*) as total_faculties FROM faculties'),
      // Total approved students
      pool.query(`SELECT COUNT(*) as total_students FROM users WHERE role = 'student' AND is_approved = true`),
      // Total staff
      pool.query(`SELECT COUNT(*) as total_staff FROM users WHERE role IN ('lecturer', 'prl', 'pl', 'fmg') AND is_approved = true`),
      // Total active courses
      pool.query('SELECT COUNT(*) as total_courses FROM courses WHERE is_active = true'),
      // Total active classes
      pool.query('SELECT COUNT(*) as total_classes FROM classes WHERE is_active = true'),
      // Total reports
      pool.query('SELECT COUNT(*) as total_reports FROM lecture_reports')
    ];

    const results = await Promise.all(queries.map(p => p.catch(e => {
      console.error('Query error:', e.message);
      return { rows: [{ count: '0' }] };
    })));

    const stats = {
      total_faculties: parseInt(results[0].rows[0]?.total_faculties || 0),
      total_students: parseInt(results[1].rows[0]?.total_students || 0),
      total_staff: parseInt(results[2].rows[0]?.total_staff || 0),
      total_courses: parseInt(results[3].rows[0]?.total_courses || 0),
      total_classes: parseInt(results[4].rows[0]?.total_classes || 0),
      total_reports: parseInt(results[5].rows[0]?.total_reports || 0)
    };

    console.log('Public stats fetched successfully:', stats);
    res.json(stats);

  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ 
      error: 'Failed to load system statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get public faculty information
router.get('/public/faculties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faculties ORDER BY name');
    res.json({ faculties: result.rows });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
});

// Get public system overview
router.get('/public/overview', async (req, res) => {
  try {
    const [
      facultiesResult,
      studentsResult,
      staffResult,
      coursesResult,
      classesResult,
      reportsResult,
      facultiesListResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_faculties FROM faculties'),
      pool.query(`SELECT COUNT(*) as total_students FROM users WHERE role = 'student' AND is_approved = true`),
      pool.query(`SELECT COUNT(*) as total_staff FROM users WHERE role IN ('lecturer', 'prl', 'pl', 'fmg') AND is_approved = true`),
      pool.query('SELECT COUNT(*) as total_courses FROM courses WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total_classes FROM classes WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as total_reports FROM lecture_reports'),
      pool.query('SELECT * FROM faculties ORDER BY name')
    ]);

    const overview = {
      total_faculties: parseInt(facultiesResult.rows[0]?.total_faculties || 0),
      total_students: parseInt(studentsResult.rows[0]?.total_students || 0),
      total_staff: parseInt(staffResult.rows[0]?.total_staff || 0),
      total_courses: parseInt(coursesResult.rows[0]?.total_courses || 0),
      total_classes: parseInt(classesResult.rows[0]?.total_classes || 0),
      total_reports: parseInt(reportsResult.rows[0]?.total_reports || 0),
      faculties: facultiesListResult.rows
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching public overview:', error);
    res.status(500).json({ error: 'Failed to load system overview' });
  }
});

// ==================== AUTHENTICATED ROUTES ====================

// Get all users (PL, FMG only)
router.get('/', auth, requireRole(['pl', 'fmg']), UserController.getAllUsers);

// Get user by ID
router.get('/:id', auth, UserController.getUserById);

// Update user (approve class reps, etc.)
router.patch('/:id', auth, requireRole(['pl', 'fmg']), UserController.updateUser);

// Get users by role and faculty
router.get('/role/:role', auth, UserController.getUsersByRole);

// Approve class representative (PL only)
router.patch('/:id/approve', auth, requireRole(['pl']), UserController.approveClassRep);

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    console.log('Fetching dashboard stats for user:', req.user.id);
    
    const query = `
      SELECT 
        COUNT(CASE WHEN role = 'student' AND is_approved = true THEN 1 END) as total_students,
        COUNT(CASE WHEN role = 'lecturer' AND is_approved = true THEN 1 END) as total_lecturers,
        COUNT(CASE WHEN role = 'prl' AND is_approved = true THEN 1 END) as total_prls,
        COUNT(CASE WHEN role = 'pl' AND is_approved = true THEN 1 END) as total_pls,
        COUNT(CASE WHEN role = 'fmg' AND is_approved = true THEN 1 END) as total_fmg,
        COUNT(CASE WHEN is_approved = false AND role = 'student' THEN 1 END) as pending_approvals
      FROM users
    `;
    
    const result = await pool.query(query);
    console.log('Dashboard stats result:', result.rows[0]);
    
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/profile/me', auth, async (req, res) => {
  try {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
});

// Update current user profile
router.patch('/profile/me', auth, async (req, res) => {
  try {
    // Only allow updating certain fields for security
    const allowedUpdates = ['name', 'program', 'class_id'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(updates);
    values.push(req.user.id);
    
    const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    
    const { password, ...userWithoutPassword } = result.rows[0];
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error while updating profile' });
  }
});

// Get unapproved class representatives (PL only)
router.get('/classreps/pending', auth, requireRole(['pl']), async (req, res) => {
  try {
    const query = `
      SELECT id, email, name, role, faculty, program, class_id, created_at 
      FROM users 
      WHERE role = 'student' AND is_approved = false 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ classReps: result.rows });
  } catch (error) {
    console.error('Get pending class reps error:', error);
    res.status(500).json({ error: 'Internal server error while fetching pending class representatives' });
  }
});

// Get faculty statistics
router.get('/stats/faculty', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    console.log('Fetching faculty stats for user:', req.user.id);
    
    const query = `
      SELECT 
        faculty,
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' AND is_approved = true THEN 1 END) as students,
        COUNT(CASE WHEN role = 'lecturer' AND is_approved = true THEN 1 END) as lecturers,
        COUNT(CASE WHEN role = 'prl' AND is_approved = true THEN 1 END) as prls,
        COUNT(CASE WHEN role = 'pl' AND is_approved = true THEN 1 END) as pls,
        COUNT(CASE WHEN role = 'fmg' AND is_approved = true THEN 1 END) as fmg
      FROM users 
      WHERE faculty IS NOT NULL
      GROUP BY faculty
      ORDER BY faculty
    `;
    
    const result = await pool.query(query);
    console.log('Faculty stats result:', result.rows);
    
    res.json({ facultyStats: result.rows });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch faculty statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get comprehensive user statistics
router.get('/stats/comprehensive', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const [
      userStats,
      roleStats,
      facultyStats,
      approvalStats
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_users,
          COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
          COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as total_lecturers,
          COUNT(CASE WHEN role IN ('prl', 'pl', 'fmg') THEN 1 END) as total_administrators
        FROM users
      `),
      pool.query(`
        SELECT 
          role,
          COUNT(*) as count,
          COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_count
        FROM users 
        GROUP BY role 
        ORDER BY role
      `),
      pool.query(`
        SELECT 
          faculty,
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as lecturers,
          COUNT(CASE WHEN role IN ('prl', 'pl', 'fmg') THEN 1 END) as administrators
        FROM users 
        WHERE faculty IS NOT NULL
        GROUP BY faculty 
        ORDER BY faculty
      `),
      pool.query(`
        SELECT 
          COUNT(CASE WHEN role = 'student' AND is_approved = false THEN 1 END) as pending_students,
          COUNT(CASE WHEN role = 'lecturer' AND is_approved = false THEN 1 END) as pending_lecturers
        FROM users
      `)
    ]);

    res.json({
      overview: userStats.rows[0],
      byRole: roleStats.rows,
      byFaculty: facultyStats.rows,
      approvals: approvalStats.rows[0],
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get comprehensive stats error:', error);
    res.status(500).json({ error: 'Failed to fetch comprehensive statistics' });
  }
});

// Change user password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    const bcrypt = require('bcryptjs');
    
    // Get current user with password
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error while changing password' });
  }
});

// Get user activity summary
router.get('/:id/activity', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only allow users to view their own activity or admins to view any
    if (req.user.id !== userId && !['prl', 'pl', 'fmg'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [
      reportsResult,
      complaintsResult,
      ratingsResult,
      signaturesResult
    ] = await Promise.all([
      // Get user's reports (if lecturer)
      pool.query(`
        SELECT COUNT(*) as total_reports,
               COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports
        FROM lecture_reports 
        WHERE lecturer_id = $1
      `, [userId]),
      
      // Get user's complaints
      pool.query(`
        SELECT COUNT(*) as total_complaints,
               COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints
        FROM complaints 
        WHERE complainant_id = $1
      `, [userId]),
      
      // Get user's ratings
      pool.query('SELECT COUNT(*) as total_ratings FROM ratings WHERE rater_id = $1', [userId]),
      
      // Get user's signatures (if student)
      pool.query('SELECT COUNT(*) as total_signatures FROM student_signatures WHERE student_id = $1', [userId])
    ]);

    const activity = {
      reports: reportsResult.rows[0],
      complaints: complaintsResult.rows[0],
      ratings: ratingsResult.rows[0],
      signatures: signaturesResult.rows[0]
    };

    res.json({ activity });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Search users
router.get('/search/:query', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const { query } = req.params;
    
    const searchQuery = `
      SELECT id, email, name, role, faculty, program, class_id, is_approved, created_at
      FROM users 
      WHERE 
        name ILIKE $1 OR 
        email ILIKE $1 OR 
        faculty ILIKE $1 OR
        program ILIKE $1 OR
        role ILIKE $1
      ORDER BY name
      LIMIT 50
    `;
    
    const result = await pool.query(searchQuery, [`%${query}%`]);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Bulk approve class representatives
router.post('/classreps/bulk-approve', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const query = `
      UPDATE users 
      SET is_approved = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ANY($1) AND role = 'student'
      RETURNING id, email, name, faculty
    `;
    
    const result = await pool.query(query, [userIds]);
    
    res.json({ 
      message: `${result.rows.length} class representatives approved successfully`,
      approvedUsers: result.rows
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ error: 'Failed to approve class representatives' });
  }
});

// Get user notifications
router.get('/notifications/me', auth, async (req, res) => {
  try {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    const result = await pool.query(query, [req.user.id]);
    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [req.params.id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router;