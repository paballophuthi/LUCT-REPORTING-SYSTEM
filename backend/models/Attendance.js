const { pool } = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const { report_id, student_id, is_present } = attendanceData;
    const query = `
      INSERT INTO attendances (report_id, student_id, is_present) 
      VALUES ($1, $2, $3) RETURNING *
    `;
    const values = [report_id, student_id, is_present];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByReport(reportId) {
    const query = `
      SELECT a.*, u.name as student_name 
      FROM attendances a 
      JOIN users u ON a.student_id = u.id 
      WHERE a.report_id = $1
    `;
    const result = await pool.query(query, [reportId]);
    return result.rows;
  }
}

module.exports = Attendance;