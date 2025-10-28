const { pool } = require('../config/database');

class User {
  static async create(userData) {
    const { email, password, name, role, faculty, program, class_id } = userData;
    const query = `
      INSERT INTO users (email, password, name, role, faculty, program, class_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [email, password, name, role, faculty, program, class_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateUser(id, updates) {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`);
    const values = Object.values(updates);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }
}

module.exports = User;