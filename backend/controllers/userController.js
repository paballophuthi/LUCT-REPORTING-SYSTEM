const User = require('../models/User');
const { pool } = require('../config/database');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          id, email, name, role, faculty, program, class_id, 
          is_approved, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      res.json({ users: result.rows });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error while fetching users' });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Internal server error while fetching user' });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.updateUser(req.params.id, req.body);
      const { password, ...userWithoutPassword } = user;
      res.json({ message: 'User updated successfully', user: userWithoutPassword });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error while updating user' });
    }
  }

  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const { faculty } = req.query;
      
      let query = `
        SELECT id, name, email, role, faculty, program, class_id, created_at 
        FROM users WHERE role = $1
      `;
      let values = [role];
      
      if (faculty) {
        query += ' AND faculty = $2';
        values.push(faculty);
      }
      
      query += ' ORDER BY name';
      
      const result = await pool.query(query, values);
      res.json({ users: result.rows });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({ error: 'Internal server error while fetching users' });
    }
  }

  static async approveClassRep(req, res) {
    try {
      const user = await User.updateUser(req.params.id, { is_approved: true });
      const { password, ...userWithoutPassword } = user;
      res.json({ message: 'Class representative approved successfully', user: userWithoutPassword });
    } catch (error) {
      console.error('Approve class rep error:', error);
      res.status(500).json({ error: 'Internal server error while approving class rep' });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'lecturer') as total_lecturers,
          (SELECT COUNT(*) FROM users WHERE role = 'prl') as total_prls,
          (SELECT COUNT(*) FROM users WHERE role = 'pl') as total_pls,
          (SELECT COUNT(*) FROM users WHERE role = 'fmg') as total_fmg,
          (SELECT COUNT(*) FROM lecture_reports) as total_reports,
          (SELECT COUNT(*) FROM lecture_reports WHERE status = 'pending_student_approval') as pending_reports,
          (SELECT COUNT(*) FROM complaints) as total_complaints,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM classes) as total_classes
      `;
      
      const statsResult = await pool.query(statsQuery);
      res.json({ stats: statsResult.rows[0] });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching stats' });
    }
  }

  static async getFacultyStats(req, res) {
    try {
      const query = `
        SELECT 
          faculty,
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as lecturers,
          COUNT(CASE WHEN role = 'prl' THEN 1 END) as prls,
          COUNT(CASE WHEN role = 'pl' THEN 1 END) as pls,
          COUNT(CASE WHEN role = 'fmg' THEN 1 END) as fmg
        FROM users 
        GROUP BY faculty
        ORDER BY faculty
      `;
      const result = await pool.query(query);
      res.json({ facultyStats: result.rows });
    } catch (error) {
      console.error('Get faculty stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching faculty statistics' });
    }
  }

  static async getPendingClassReps(req, res) {
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
  }
}

module.exports = UserController;