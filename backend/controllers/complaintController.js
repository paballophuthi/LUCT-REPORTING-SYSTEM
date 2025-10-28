const Complaint = require('../models/Complaint');
const { pool } = require('../config/database');

class ComplaintController {
  static async createComplaint(req, res) {
    try {
      const { title, description, against_user_id, against_role, category, is_anonymous } = req.body;

      // Prevent self-complaints
      if (against_user_id === req.user.id) {
        return res.status(400).json({ error: 'Cannot file complaint against yourself' });
      }

      // Validate complaint routing based on user role
      if (!ComplaintController.isValidComplaintRoute(req.user.role, against_role)) {
        return res.status(400).json({ error: 'Invalid complaint route for your role' });
      }

      const complaint = await Complaint.create({
        title,
        description,
        complainant_id: req.user.id,
        complainant_role: req.user.role,
        against_user_id,
        against_role,
        category: category || 'general',
        is_anonymous: is_anonymous || false
      });

      res.status(201).json({
        message: 'Complaint submitted successfully',
        complaint
      });
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ error: 'Internal server error while creating complaint' });
    }
  }

  static async getMyComplaints(req, res) {
    try {
      const complaints = await Complaint.findByComplainant(req.user.id);
      res.json({ complaints });
    } catch (error) {
      console.error('Get my complaints error:', error);
      res.status(500).json({ error: 'Internal server error while fetching complaints' });
    }
  }

  static async getComplaintsForReview(req, res) {
    try {
      const complaints = await Complaint.findForReview(req.user.role, req.user.faculty);
      res.json({ complaints });
    } catch (error) {
      console.error('Get complaints for review error:', error);
      res.status(500).json({ error: 'Internal server error while fetching complaints' });
    }
  }

  static async addComplaintResponse(req, res) {
    try {
      const { response_text } = req.body;
      const complaintId = req.params.id;

      // Verify the complaint exists and user has permission to respond
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Add response
      const query = `
        INSERT INTO complaint_responses (complaint_id, responder_id, response_text)
        VALUES ($1, $2, $3) RETURNING *
      `;
      const result = await pool.query(query, [complaintId, req.user.id, response_text]);

      // Update complaint status
      await pool.query(
        'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', complaintId]
      );

      res.json({
        message: 'Response added successfully and complaint marked as resolved',
        response: result.rows[0]
      });
    } catch (error) {
      console.error('Add complaint response error:', error);
      res.status(500).json({ error: 'Internal server error while adding response' });
    }
  }

  static async getComplaintResponses(req, res) {
    try {
      const query = `
        SELECT cr.*, u.name as responder_name, u.role as responder_role
        FROM complaint_responses cr 
        JOIN users u ON cr.responder_id = u.id 
        WHERE cr.complaint_id = $1 
        ORDER BY cr.created_at ASC
      `;
      const result = await pool.query(query, [req.params.id]);
      res.json({ responses: result.rows });
    } catch (error) {
      console.error('Get complaint responses error:', error);
      res.status(500).json({ error: 'Internal server error while fetching responses' });
    }
  }

  static async getComplaintStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_complaints,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_complaints,
          COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review_complaints,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints,
          COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_complaints,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_complaints,
          COUNT(CASE WHEN against_role = 'lecturer' THEN 1 END) as against_lecturers,
          COUNT(CASE WHEN against_role = 'prl' THEN 1 END) as against_prls,
          COUNT(CASE WHEN against_role = 'pl' THEN 1 END) as against_pls
        FROM complaints
      `;
      const result = await pool.query(query);
      res.json({ stats: result.rows[0] });
    } catch (error) {
      console.error('Get complaint stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching complaint statistics' });
    }
  }

  static async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, priority } = req.body;

      // Check if complaint exists
      const complaintCheck = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
      if (complaintCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const query = `
        UPDATE complaints 
        SET status = COALESCE($1, status), 
            priority = COALESCE($2, priority),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 
        RETURNING *
      `;
      const values = [status, priority, id];

      const result = await pool.query(query, values);
      res.json({ message: 'Complaint updated successfully', complaint: result.rows[0] });
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ error: 'Internal server error while updating complaint' });
    }
  }

  // Helper method to validate complaint routing
  static isValidComplaintRoute(complainantRole, againstRole) {
    const validRoutes = {
      'student': ['lecturer'],
      'lecturer': ['prl'],
      'prl': ['pl'],
      'pl': ['fmg']
    };

    return validRoutes[complainantRole] && validRoutes[complainantRole].includes(againstRole);
  }
}

module.exports = ComplaintController;