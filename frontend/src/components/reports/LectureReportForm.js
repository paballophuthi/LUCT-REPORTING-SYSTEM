import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LectureReportForm = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    faculty_name: user.faculty,
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    course_name: '',
    course_code: '',
    students_present: '',
    total_students: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: ''
  });
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoursesAndClasses();
  }, []);

  const fetchCoursesAndClasses = async () => {
    try {
      const [coursesRes, classesRes] = await Promise.all([
        api.get(`/courses/faculty/${user.faculty}`),
        api.get(`/classes/faculty/${user.faculty}`)
      ]);
      
      setCourses(coursesRes.data.courses);
      setClasses(classesRes.data.classes);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Auto-fill course code when course name is selected
    if (e.target.name === 'course_name') {
      const selectedCourse = courses.find(course => course.name === e.target.value);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          course_code: selectedCourse.code
        }));
      }
    }

    // Auto-fill total students when class is selected
    if (e.target.name === 'class_name') {
      const selectedClass = classes.find(cls => cls.name === e.target.value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          total_students: selectedClass.total_students
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/reports', formData);
      alert('Report submitted successfully!');
      onSuccess();
    } catch (error) {
      alert('Error submitting report: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit Lecture Report</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Faculty</label>
            <input
              type="text"
              name="faculty_name"
              value={formData.faculty_name}
              className="form-input"
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">Class Name</label>
            <select
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Week of Reporting</label>
            <input
              type="text"
              name="week_of_reporting"
              value={formData.week_of_reporting}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Week 6"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Lecture</label>
            <input
              type="date"
              name="date_of_lecture"
              value={formData.date_of_lecture}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Name</label>
            <select
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Course Code</label>
            <input
              type="text"
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Students Present</label>
            <input
              type="number"
              name="students_present"
              value={formData.students_present}
              onChange={handleChange}
              className="form-input"
              min="1"
              max={formData.total_students}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Students</label>
            <input
              type="number"
              name="total_students"
              value={formData.total_students}
              onChange={handleChange}
              className="form-input"
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Room 101, Building A"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Time</label>
            <input
              type="time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Topic Taught</label>
          <textarea
            name="topic_taught"
            value={formData.topic_taught}
            onChange={handleChange}
            className="form-input"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Learning Outcomes</label>
          <textarea
            name="learning_outcomes"
            value={formData.learning_outcomes}
            onChange={handleChange}
            className="form-input"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Recommendations (Optional)</label>
          <textarea
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            className="form-input"
            rows="2"
            placeholder="Any recommendations or issues encountered..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LectureReportForm;