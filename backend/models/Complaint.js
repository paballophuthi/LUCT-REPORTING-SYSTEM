const { pool } = require('../config/database');

class Complaint {
  static async create(complaintData) {
    const { title, description, complainant_id, complainant_role, against_user_id, against_role } = complaintData;
    const query = `
      INSERT INTO complaints (title, description, complainant_id, complainant_role, against_user_id, against_role)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [title, description, complainant_id, complainant_role, against_user_id, against_role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByComplainant(complainantId) {
    const query = `
      SELECT c.*, u.name as against_user_name 
      FROM complaints c 
      LEFT JOIN users u ON c.against_user_id = u.id 
      WHERE c.complainant_id = $1 
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [complainantId]);
    return result.rows;
  }

  static async findForReview(role, faculty = null) {
    let query = '';
    let values = [];
    
    if (role === 'prl') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'lecturer' AND u.faculty = $1 
        ORDER BY c.created_at DESC
      `;
      values = [faculty];
    } else if (role === 'pl') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'prl' AND u.faculty = $1 
        ORDER BY c.created_at DESC
      `;
      values = [faculty];
    } else if (role === 'fmg') {
      query = `
        SELECT c.*, u.name as complainant_name 
        FROM complaints c 
        JOIN users u ON c.complainant_id = u.id 
        WHERE c.against_role = 'pl' 
        ORDER BY c.created_at DESC
      `;
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM complaints WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Complaint;