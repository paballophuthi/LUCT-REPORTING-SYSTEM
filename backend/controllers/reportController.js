const LectureReport = require('../models/LectureReport');
const StudentSignature = require('../models/StudentSignature');
const { pool } = require('../config/database');

class ReportController {
  static async createReport(req, res) {
    try {
      const reportData = {
        ...req.body,
        lecturer_id: req.user.id,
        lecturer_name: req.user.name
      };

      const report = await LectureReport.create(reportData);
      
      res.status(201).json({
        message: 'Report created successfully and sent for student approval',
        report
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Internal server error while creating report' });
    }
  }

  static async getMyReports(req, res) {
    try {
      const reports = await LectureReport.findByLecturer(req.user.id);
      res.json({ reports });
    } catch (error) {
      console.error('Get my reports error:', error);
      res.status(500).json({ error: 'Internal server error while fetching reports' });
    }
  }

  static async getAllReports(req, res) {
    try {
      const reports = await LectureReport.findAll();
      res.json({ reports });
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({ error: 'Internal server error while fetching reports' });
    }
  }

  static async getReportById(req, res) {
    try {
      const report = await LectureReport.findById(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ report });
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({ error: 'Internal server error while fetching report' });
    }
  }

  static async updateReportStatus(req, res) {
    try {
      const { status, feedback_prl, feedback_pl } = req.body;
      
      const updateData = { status };
      if (feedback_prl !== undefined) updateData.feedback_prl = feedback_prl;
      if (feedback_pl !== undefined) updateData.feedback_pl = feedback_pl;
      
      const report = await LectureReport.updateStatus(req.params.id, updateData);
      
      res.json({
        message: `Report status updated to ${status}`,
        report
      });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({ error: 'Internal server error while updating report status' });
    }
  }

  static async addStudentSignature(req, res) {
    try {
      const { report_id, signature_data } = req.body;
      
      const signature = await StudentSignature.create({
        report_id,
        student_id: req.user.id,
        signature_data
      });

      // Update report status to student_approved
      await LectureReport.updateStatus(report_id, 'student_approved');

      res.status(201).json({
        message: 'Signature added successfully and report approved',
        signature
      });
    } catch (error) {
      console.error('Add student signature error:', error);
      res.status(500).json({ error: 'Internal server error while adding signature' });
    }
  }

  static async getReportStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN status = 'pending_student_approval' THEN 1 END) as pending_approval,
          COUNT(CASE WHEN status = 'student_approved' THEN 1 END) as student_approved,
          COUNT(CASE WHEN status = 'prl_reviewed' THEN 1 END) as prl_reviewed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN faculty_name = 'FICT' THEN 1 END) as fict_reports,
          COUNT(CASE WHEN faculty_name = 'FBMG' THEN 1 END) as fbmg_reports,
          COUNT(CASE WHEN faculty_name = 'FABE' THEN 1 END) as fabe_reports,
          AVG(students_present::FLOAT / total_students * 100) as avg_attendance_rate
        FROM lecture_reports
      `;
      const result = await pool.query(query);
      res.json({ stats: result.rows[0] });
    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching report statistics' });
    }
  }

  static async getReportsByFaculty(req, res) {
    try {
      const { faculty } = req.params;
      
      const query = `
        SELECT * FROM lecture_reports 
        WHERE faculty_name = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [faculty]);
      res.json({ reports: result.rows });
    } catch (error) {
      console.error('Get reports by faculty error:', error);
      res.status(500).json({ error: 'Internal server error while fetching faculty reports' });
    }
  }

  static async searchReports(req, res) {
    try {
      const { query } = req.params;
      
      const searchQuery = `
        SELECT * FROM lecture_reports 
        WHERE 
          course_name ILIKE $1 OR 
          course_code ILIKE $1 OR 
          lecturer_name ILIKE $1 OR 
          class_name ILIKE $1 OR
          topic_taught ILIKE $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(searchQuery, [`%${query}%`]);
      res.json({ reports: result.rows });
    } catch (error) {
      console.error('Search reports error:', error);
      res.status(500).json({ error: 'Internal server error while searching reports' });
    }
  }
}

module.exports = ReportController;