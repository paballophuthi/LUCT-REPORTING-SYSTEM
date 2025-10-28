const Course = require('../models/Course');
const Class = require('../models/Class');
const { pool } = require('../config/database');

class CourseController {
  static async getAllCourses(req, res) {
    try {
      const courses = await Course.findAll();
      res.json({ courses });
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Internal server error while fetching courses' });
    }
  }

  static async getCoursesByFaculty(req, res) {
    try {
      const { faculty } = req.params;
      const courses = await Course.findByFaculty(faculty);
      res.json({ courses });
    } catch (error) {
      console.error('Get courses by faculty error:', error);
      res.status(500).json({ error: 'Internal server error while fetching courses' });
    }
  }

  static async createCourse(req, res) {
    try {
      const { name, code, faculty, program_id, credits, description } = req.body;
      
      // Check if course code already exists
      const existingCourse = await pool.query('SELECT * FROM courses WHERE code = $1', [code]);
      if (existingCourse.rows.length > 0) {
        return res.status(400).json({ error: 'Course code already exists' });
      }

      const course = await Course.create({ 
        name, 
        code, 
        faculty, 
        program_id, 
        credits, 
        description 
      });
      res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Internal server error while creating course' });
    }
  }

  static async assignCourse(req, res) {
    try {
      const { lecturer_id, course_id, class_id, academic_year, semester } = req.body;
      
      // Check if assignment already exists
      const existingAssignment = await pool.query(
        'SELECT * FROM assignments WHERE lecturer_id = $1 AND course_id = $2 AND class_id = $3 AND academic_year = $4 AND semester = $5',
        [lecturer_id, course_id, class_id, academic_year || '2024', semester || '1']
      );
      
      if (existingAssignment.rows.length > 0) {
        return res.status(400).json({ error: 'Course is already assigned to this lecturer for this class and semester' });
      }

      const query = `
        INSERT INTO assignments (lecturer_id, course_id, class_id, assigned_by, academic_year, semester) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      const values = [
        lecturer_id, 
        course_id, 
        class_id, 
        req.user.id,
        academic_year || '2024', 
        semester || '1'
      ];
      
      const result = await pool.query(query, values);
      res.status(201).json({ message: 'Course assigned successfully', assignment: result.rows[0] });
    } catch (error) {
      console.error('Assign course error:', error);
      res.status(500).json({ error: 'Internal server error while assigning course' });
    }
  }

  static async getAssignments(req, res) {
    try {
      const query = `
        SELECT 
          a.*, 
          u.name as lecturer_name, 
          u.email as lecturer_email,
          c.name as course_name, 
          c.code as course_code,
          c.faculty as course_faculty,
          cl.name as class_name,
          cl.code as class_code,
          cl.faculty as class_faculty
        FROM assignments a
        JOIN users u ON a.lecturer_id = u.id
        JOIN courses c ON a.course_id = c.id
        JOIN classes cl ON a.class_id = cl.id
        ORDER BY a.assigned_at DESC
      `;
      const result = await pool.query(query);
      res.json({ assignments: result.rows });
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ error: 'Internal server error while fetching assignments' });
    }
  }

  static async getAllClasses(req, res) {
    try {
      const classes = await Class.findAll();
      res.json({ classes });
    } catch (error) {
      console.error('Get all classes error:', error);
      res.status(500).json({ error: 'Internal server error while fetching classes' });
    }
  }

  static async getClassesByFaculty(req, res) {
    try {
      const { faculty } = req.params;
      const classes = await Class.findByFaculty(faculty);
      res.json({ classes });
    } catch (error) {
      console.error('Get classes by faculty error:', error);
      res.status(500).json({ error: 'Internal server error while fetching classes' });
    }
  }

  static async createClass(req, res) {
    try {
      const { name, code, faculty, program_id, total_students, academic_year, semester } = req.body;
      
      // Check if class code already exists
      const existingClass = await pool.query('SELECT * FROM classes WHERE code = $1', [code]);
      if (existingClass.rows.length > 0) {
        return res.status(400).json({ error: 'Class code already exists' });
      }

      const newClass = await Class.create({ 
        name, 
        code, 
        faculty, 
        program_id, 
        total_students, 
        academic_year: academic_year || '2024', 
        semester: semester || '1' 
      });
      res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({ error: 'Internal server error while creating class' });
    }
  }

  static async getCourseStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_courses,
          COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_courses,
          COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_courses,
          COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_courses
        FROM courses
      `;
      const result = await pool.query(query);
      res.json({ stats: result.rows[0] });
    } catch (error) {
      console.error('Get course stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching course statistics' });
    }
  }

  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { name, code, credits, description, is_active } = req.body;
      
      // Check if course exists
      const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Check if new code conflicts with existing course
      if (code && code !== courseCheck.rows[0].code) {
        const codeCheck = await pool.query('SELECT * FROM courses WHERE code = $1 AND id != $2', [code, id]);
        if (codeCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Course code already exists' });
        }
      }
      
      const query = `
        UPDATE courses 
        SET name = COALESCE($1, name), 
            code = COALESCE($2, code), 
            credits = COALESCE($3, credits), 
            description = COALESCE($4, description), 
            is_active = COALESCE($5, is_active)
        WHERE id = $6 
        RETURNING *
      `;
      const values = [name, code, credits, description, is_active, id];
      
      const result = await pool.query(query, values);
      res.json({ message: 'Course updated successfully', course: result.rows[0] });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Internal server error while updating course' });
    }
  }

  static async getClassStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_classes,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_classes,
          COUNT(CASE WHEN faculty = 'FICT' THEN 1 END) as fict_classes,
          COUNT(CASE WHEN faculty = 'FBMG' THEN 1 END) as fbmg_classes,
          COUNT(CASE WHEN faculty = 'FABE' THEN 1 END) as fabe_classes,
          SUM(total_students) as total_students_enrolled
        FROM classes
      `;
      const result = await pool.query(query);
      res.json({ stats: result.rows[0] });
    } catch (error) {
      console.error('Get class stats error:', error);
      res.status(500).json({ error: 'Internal server error while fetching class statistics' });
    }
  }
}

module.exports = CourseController;