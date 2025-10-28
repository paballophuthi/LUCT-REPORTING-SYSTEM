import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      let endpoint = '/courses';
      if (filter !== 'all') {
        endpoint = `/courses/faculty/${filter}`;
      }
      
      const response = await api.get(endpoint);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Course Catalog</h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto' }}
        >
          <option value="all">All Faculties</option>
          <option value="FICT">FICT</option>
          <option value="FBMG">FBMG</option>
          <option value="FABE">FABE</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Faculty</th>
              <th>Program</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>
                  <strong>{course.code}</strong>
                </td>
                <td>{course.name}</td>
                <td>
                  <span className="badge badge-primary">{course.faculty}</span>
                </td>
                <td>{course.program_id || 'All Programs'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
            No courses found.
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#888' }}>
        Showing {courses.length} courses
        {filter !== 'all' && ` in ${filter}`}
      </div>
    </div>
  );
};

export default CourseList;