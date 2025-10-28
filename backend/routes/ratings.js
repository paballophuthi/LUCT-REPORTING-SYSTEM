const express = require('express');
const { auth } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Submit rating
router.post('/', auth, async (req, res) => {
  try {
    const { rated_entity_type, rated_entity_id, rating_value, comment } = req.body;

    // Check if user has already rated this entity
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE rater_id = $1 AND rated_entity_type = $2 AND rated_entity_id = $3',
      [req.user.id, rated_entity_type, rated_entity_id]
    );

    if (existingRating.rows.length > 0) {
      return res.status(400).json({ error: 'You have already rated this ' + rated_entity_type });
    }

    const query = `
      INSERT INTO ratings (rater_id, rated_entity_type, rated_entity_id, rating_value, comment)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [req.user.id, rated_entity_type, rated_entity_id, rating_value, comment];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Rating submitted successfully', rating: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ratings for an entity
router.get('/entity/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const query = `
      SELECT r.*, u.name as rater_name 
      FROM ratings r 
      JOIN users u ON r.rater_id = u.id 
      WHERE r.rated_entity_type = $1 AND r.rated_entity_id = $2 
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [type, id]);
    
    res.json({ ratings: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my ratings
router.get('/my-ratings', auth, async (req, res) => {
  try {
    const query = `
      SELECT * FROM ratings 
      WHERE rater_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [req.user.id]);
    
    res.json({ ratings: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;