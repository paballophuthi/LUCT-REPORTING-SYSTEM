const { pool } = require('../config/database');

class Course {
  static async findAll() {
    const query = 'SELECT * FROM courses ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByFaculty(faculty) {
    const query = 'SELECT * FROM courses WHERE faculty = $1 ORDER BY name';
    const result = await pool.query(query, [faculty]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM courses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(courseData) {
    const { name, code, faculty, program_id } = courseData;
    const query = `
      INSERT INTO courses (name, code, faculty, program_id) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [name, code, faculty, program_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Course;