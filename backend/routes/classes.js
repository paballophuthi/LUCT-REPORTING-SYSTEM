const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const query = `
      SELECT c.*, p.name as program_name, f.name as faculty_name 
      FROM classes c
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN faculties f ON c.faculty = f.code
      ORDER BY c.name
    `;
    const result = await pool.query(query);
    res.json({ classes: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get classes by faculty
router.get('/faculty/:faculty', auth, async (req, res) => {
  try {
    const { faculty } = req.params;
    const query = `
      SELECT c.*, p.name as program_name 
      FROM classes c
      LEFT JOIN programs p ON c.program_id = p.id
      WHERE c.faculty = $1 
      ORDER BY c.name
    `;
    const result = await pool.query(query, [faculty]);
    res.json({ classes: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new class (PL only)
router.post('/', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { name, code, faculty, program_id, total_students, academic_year, semester } = req.body;
    
    // Check if class code already exists
    const existingClass = await pool.query('SELECT * FROM classes WHERE code = $1', [code]);
    if (existingClass.rows.length > 0) {
      return res.status(400).json({ error: 'Class code already exists' });
    }
    
    const query = `
      INSERT INTO classes (name, code, faculty, program_id, total_students, academic_year, semester) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [name, code, faculty, program_id, total_students, academic_year || '2024', semester || '1'];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Class created successfully', class: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get class statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_classes,
        COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_classes,
        COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_classes,
        COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_classes,
        SUM(total_students) as total_students_enrolled
      FROM classes
    `;
    const result = await pool.query(query);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get class stats error:', error);
    res.status(500).json({ error: 'Internal server error while fetching class statistics' });
  }
});

// Update class (PL only)
router.patch('/:id', auth, requireRole(['pl']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, total_students, academic_year, semester, is_active } = req.body;
    
    // Check if class exists
    const classCheck = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    if (classCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if new code conflicts with existing class
    if (code && code !== classCheck.rows[0].code) {
      const codeCheck = await pool.query('SELECT * FROM classes WHERE code = $1 AND id != $2', [code, id]);
      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Class code already exists' });
      }
    }
    
    const query = `
      UPDATE classes 
      SET name = COALESCE($1, name), 
          code = COALESCE($2, code), 
          total_students = COALESCE($3, total_students), 
          academic_year = COALESCE($4, academic_year), 
          semester = COALESCE($5, semester), 
          is_active = COALESCE($6, is_active)
      WHERE id = $7 
      RETURNING *
    `;
    const values = [name, code, total_students, academic_year, semester, is_active, id];
    
    const result = await pool.query(query, values);
    res.json({ message: 'Class updated successfully', class: result.rows[0] });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Internal server error while updating class' });
  }
});

// Get students in a class
router.get('/:id/students', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, email, program, class_id, created_at
      FROM users 
      WHERE class_id = (SELECT code FROM classes WHERE id = $1) 
        AND role = 'student'
      ORDER BY name
    `;
    const result = await pool.query(query, [id]);
    res.json({ students: result.rows });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Internal server error while fetching class students' });
  }
});

module.exports = router;