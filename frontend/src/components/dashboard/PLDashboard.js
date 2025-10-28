import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CourseManagement from '../courses/CourseManagement';

const PLDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalLecturers: 0,
    totalCourses: 0,
    totalClasses: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes, classesRes] = await Promise.all([
        api.get('/users/role/lecturer?faculty=' + user.faculty),
        api.get('/courses/faculty/' + user.faculty),
        api.get('/classes/faculty/' + user.faculty)
      ]);

      setStats({
        totalLecturers: usersRes.data.users.length,
        totalCourses: coursesRes.data.courses.length,
        totalClasses: classesRes.data.classes.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Lecturers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalLecturers}</p>
        </div>

        <div className="dashboard-card">
          <h3>Courses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalCourses}</p>
        </div>

        <div className="dashboard-card">
          <h3>Classes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalClasses}</p>
        </div>

        <div className="dashboard-card">
          <h3>Program</h3>
          <p>{user.program || 'All Programs'}</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('management')}
            className={`btn ${activeTab === 'management' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Course Management
          </button>
        </div>

        {activeTab === 'management' && <CourseManagement />}
        
        {activeTab === 'overview' && (
          <div className="card">
            <h3>Program Leader Responsibilities</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
              <li>Assign courses and classes to lecturers</li>
              <li>Manage program curriculum</li>
              <li>Review complaints against PRLs</li>
              <li>Monitor program performance</li>
              <li>Approve class representative registrations</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLDashboard;