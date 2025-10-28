const { pool } = require('../config/database');

class StudentSignature {
  static async create(signatureData) {
    const { report_id, student_id, signature_data } = signatureData;
    const query = `
      INSERT INTO student_signatures (report_id, student_id, signature_data) 
      VALUES ($1, $2, $3) RETURNING *
    `;
    const values = [report_id, student_id, signature_data];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByReport(reportId) {
    const query = `
      SELECT ss.*, u.name as student_name 
      FROM student_signatures ss 
      JOIN users u ON ss.student_id = u.id 
      WHERE ss.report_id = $1
    `;
    const result = await pool.query(query, [reportId]);
    return result.rows;
  }

  static async findByStudentAndReport(studentId, reportId) {
    const query = 'SELECT * FROM student_signatures WHERE student_id = $1 AND report_id = $2';
    const result = await pool.query(query, [studentId, reportId]);
    return result.rows[0];
  }
}

module.exports = StudentSignature;