const validateReport = (req, res, next) => {
  const requiredFields = [
    'faculty_name', 'class_name', 'week_of_reporting', 'date_of_lecture',
    'course_name', 'course_code', 'students_present', 'total_students',
    'venue', 'scheduled_time', 'topic_taught', 'learning_outcomes'
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  if (req.body.students_present > req.body.total_students) {
    return res.status(400).json({ error: 'Students present cannot exceed total students' });
  }

  next();
};

const validateComplaint = (req, res, next) => {
  const { title, description, against_user_id, against_role } = req.body;

  if (!title || !description || !against_user_id || !against_role) {
    return res.status(400).json({ error: 'All complaint fields are required' });
  }

  if (against_role === req.user.role) {
    return res.status(400).json({ error: 'Cannot file complaint against same role' });
  }

  next();
};

module.exports = { validateReport, validateComplaint };