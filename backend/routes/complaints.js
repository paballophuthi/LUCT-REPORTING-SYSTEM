const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Create complaint
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, against_user_id, against_role } = req.body;
    
    const query = `
      INSERT INTO complaints (title, description, complainant_id, complainant_role, against_user_id, against_role)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [title, description, req.user.id, req.user.role, against_user_id, against_role];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Complaint submitted successfully', complaint: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my complaints
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.name as against_user_name 
      FROM complaints c 
      LEFT JOIN users u ON c.against_user_id = u.id 
      WHERE c.complainant_id = $1 
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [req.user.id]);
    res.json({ complaints: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get complaints for review (PRL, PL, FMG based on role)
router.get('/for-review', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    let query = '';
    let values = [];
    
    if (req.user.role === 'prl') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'lecturer' AND u.faculty = $1 
        ORDER BY c.created_at DESC
      `;
      values = [req.user.faculty];
    } else if (req.user.role === 'pl') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'prl' AND u.faculty = $1 
        ORDER BY c.created_at DESC
      `;
      values = [req.user.faculty];
    } else if (req.user.role === 'fmg') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'pl' 
        ORDER BY c.created_at DESC
      `;
    }
    
    const result = await pool.query(query, values);
    res.json({ complaints: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add response to complaint
router.post('/:id/response', auth, requireRole(['prl', 'pl', 'fmg']), async (req, res) => {
  try {
    const { response_text } = req.body;
    
    const responseQuery = `
      INSERT INTO complaint_responses (complaint_id, responder_id, response_text)
      VALUES ($1, $2, $3) RETURNING *
    `;
    await pool.query(responseQuery, [req.params.id, req.user.id, response_text]);
    
    // Update complaint status
    const updateQuery = 'UPDATE complaints SET status = $1 WHERE id = $2';
    await pool.query(updateQuery, ['resolved', req.params.id]);
    
    res.json({ message: 'Response added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get complaint responses
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const query = `
      SELECT cr.*, u.name as responder_name 
      FROM complaint_responses cr 
      JOIN users u ON cr.responder_id = u.id 
      WHERE cr.complaint_id = $1 
      ORDER BY cr.created_at ASC
    `;
    const result = await pool.query(query, [req.params.id]);
    res.json({ responses: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;