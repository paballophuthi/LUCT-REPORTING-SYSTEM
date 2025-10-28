const { pool } = require('../config/database');

class Class {
  static async findAll() {
    const query = 'SELECT * FROM classes ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByFaculty(faculty) {
    const query = 'SELECT * FROM classes WHERE faculty = $1 ORDER BY name';
    const result = await pool.query(query, [faculty]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM classes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(classData) {
    const { name, code, faculty, program_id, total_students } = classData;
    const query = `
      INSERT INTO classes (name, code, faculty, program_id, total_students) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [name, code, faculty, program_id, total_students];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Class;