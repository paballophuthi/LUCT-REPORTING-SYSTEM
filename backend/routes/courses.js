const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const query = 'SELECT * FROM courses ORDER BY name';
    const result = await pool.query(query);
    res.json({ courses: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by faculty
router.get('/faculty/:faculty', auth, async (req, res) => {
  try {
    const { faculty } = req.params;
    const query = 'SELECT * FROM courses WHERE faculty = $1 ORDER BY name';
    const result = await pool.query(query, [faculty]);
    res.json({ courses: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new course (PL only)
router.post('/', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { name, code, faculty, program_id, credits, description } = req.body;
    
    // Check if course code already exists
    const existingCourse = await pool.query('SELECT * FROM courses WHERE code = $1', [code]);
    if (existingCourse.rows.length > 0) {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    
    const query = `
      INSERT INTO courses (name, code, faculty, program_id, credits, description) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [name, code, faculty, program_id, credits, description];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Course created successfully', course: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign course to lecturer (PL only)
router.post('/assign', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { lecturer_id, course_id, class_id, academic_year, semester } = req.body;
    
    // Check if assignment already exists
    const existingAssignment = await pool.query(
      'SELECT * FROM assignments WHERE lecturer_id = $1 AND course_id = $2 AND class_id = $3 AND academic_year = $4 AND semester = $5',
      [lecturer_id, course_id, class_id, academic_year || '2024', semester || '1']
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ error: 'Course is already assigned to this lecturer for this class and semester' });
    }
    
    const query = `
      INSERT INTO assignments (lecturer_id, course_id, class_id, assigned_by, academic_year, semester) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [
      lecturer_id, 
      course_id, 
      class_id, 
      req.user.id,
      academic_year || '2024', 
      semester || '1'
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Course assigned successfully', assignment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments
router.get('/assignments', auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        a.*, 
        u.name as lecturer_name, 
        u.email as lecturer_email,
        c.name as course_name, 
        c.code as course_code,
        c.faculty as course_faculty,
        cl.name as class_name,
        cl.code as class_code,
        cl.faculty as class_faculty
      FROM assignments a
      JOIN users u ON a.lecturer_id = u.id
      JOIN courses c ON a.course_id = c.id
      JOIN classes cl ON a.class_id = cl.id
      ORDER BY a.assigned_at DESC
    `;
    const result = await pool.query(query);
    res.json({ assignments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_courses,
        COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_courses,
        COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_courses,
        COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_courses
      FROM courses
    `;
    const result = await pool.query(query);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ error: 'Internal server error while fetching course statistics' });
  }
});

// Update course (PL only)
router.patch('/:id', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, credits, description, is_active } = req.body;
    
    // Check if course exists
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if new code conflicts with existing course
    if (code && code !== courseCheck.rows[0].code) {
      const codeCheck = await pool.query('SELECT * FROM courses WHERE code = $1 AND id != $2', [code, id]);
      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Course code already exists' });
      }
    }
    
    const query = `
      UPDATE courses 
      SET name = COALESCE($1, name), 
          code = COALESCE($2, code), 
          credits = COALESCE($3, credits), 
          description = COALESCE($4, description), 
          is_active = COALESCE($5, is_active)
      WHERE id = $6 
      RETURNING *
    `;
    const values = [name, code, credits, description, is_active, id];
    
    const result = await pool.query(query, values);
    res.json({ message: 'Course updated successfully', course: result.rows[0] });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error while updating course' });
  }
});

module.exports = router;