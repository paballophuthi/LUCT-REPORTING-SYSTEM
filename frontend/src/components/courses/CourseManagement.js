import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CourseManagement = () => {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    lecturer_id: '',
    course_id: '',
    class_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lecturersRes, coursesRes, classesRes, assignmentsRes] = await Promise.all([
        api.get('/users/role/lecturer?faculty=' + user.faculty),
        api.get('/courses/faculty/' + user.faculty),
        api.get('/classes/faculty/' + user.faculty),
        api.get('/courses/assignments')
      ]);

      setLecturers(lecturersRes.data.users);
      setCourses(coursesRes.data.courses);
      setClasses(classesRes.data.classes);
      setAssignments(assignmentsRes.data.assignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/courses/assign', assignmentData);
      alert('Course assigned successfully!');
      setShowAssignmentForm(false);
      setAssignmentData({ lecturer_id: '', course_id: '', class_id: '' });
      fetchData();
    } catch (error) {
      alert('Error assigning course: ' + error.response?.data?.error);
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Course Assignments</h3>
          <button 
            onClick={() => setShowAssignmentForm(true)}
            className="btn btn-primary"
          >
            Assign Course
          </button>
        </div>

        {showAssignmentForm && (
          <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#333' }}>
            <h4>Assign Course to Lecturer</h4>
            <form onSubmit={handleAssignmentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Lecturer</label>
                  <select
                    value={assignmentData.lecturer_id}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, lecturer_id: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    value={assignmentData.course_id}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, course_id: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select
                    value={assignmentData.class_id}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, class_id: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Assign
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAssignmentForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Lecturer</th>
                <th>Course</th>
                <th>Class</th>
                <th>Assigned By</th>
                <th>Date Assigned</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.lecturer_name}</td>
                  <td>{assignment.course_name}</td>
                  <td>{assignment.class_name}</td>
                  <td>PL</td>
                  <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;