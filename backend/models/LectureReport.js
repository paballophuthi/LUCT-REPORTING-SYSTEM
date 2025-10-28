const { pool } = require('../config/database');

class LectureReport {
  static async create(reportData) {
    const {
      faculty_name, class_name, week_of_reporting, date_of_lecture,
      course_name, course_code, lecturer_name, students_present,
      total_students, venue, scheduled_time, topic_taught,
      learning_outcomes, recommendations, lecturer_id, status
    } = reportData;

    const query = `
      INSERT INTO lecture_reports 
      (faculty_name, class_name, week_of_reporting, date_of_lecture, course_name, 
       course_code, lecturer_name, students_present, total_students, venue, 
       scheduled_time, topic_taught, learning_outcomes, recommendations, 
       lecturer_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      faculty_name, class_name, week_of_reporting, date_of_lecture,
      course_name, course_code, lecturer_name, students_present,
      total_students, venue, scheduled_time, topic_taught,
      learning_outcomes, recommendations, lecturer_id, status || 'pending_student_approval'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByLecturer(lecturerId) {
    const query = 'SELECT * FROM lecture_reports WHERE lecturer_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [lecturerId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM lecture_reports WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE lecture_reports SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM lecture_reports ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = LectureReport;