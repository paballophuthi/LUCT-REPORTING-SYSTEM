import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FMGDashboard = () => {
  const { user } = useAuth();
  const [facultyStats, setFacultyStats] = useState({
    FICT: { reports: 0, lecturers: 0, students: 0 },
    FBMG: { reports: 0, lecturers: 0, students: 0 },
    FABE: { reports: 0, lecturers: 0, students: 0 }
  });

  useEffect(() => {
    fetchFacultyStats();
  }, []);

  const fetchFacultyStats = async () => {
    try {
      // This would typically come from a dedicated stats endpoint
      const [reportsRes, usersRes] = await Promise.all([
        api.get('/reports'),
        api.get('/users')
      ]);

      const reports = reportsRes.data.reports;
      const users = usersRes.data.users;

      const stats = {
        FICT: { reports: 0, lecturers: 0, students: 0 },
        FBMG: { reports: 0, lecturers: 0, students: 0 },
        FABE: { reports: 0, lecturers: 0, students: 0 }
      };

      reports.forEach(report => {
        if (stats[report.faculty_name]) {
          stats[report.faculty_name].reports++;
        }
      });

      users.forEach(user => {
        if (stats[user.faculty]) {
          if (user.role === 'lecturer') stats[user.faculty].lecturers++;
          if (user.role === 'student') stats[user.faculty].students++;
        }
      });

      setFacultyStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>FICT</h3>
          <p>Reports: {facultyStats.FICT.reports}</p>
          <p>Lecturers: {facultyStats.FICT.lecturers}</p>
          <p>Students: {facultyStats.FICT.students}</p>
        </div>

        <div className="dashboard-card">
          <h3>FBMG</h3>
          <p>Reports: {facultyStats.FBMG.reports}</p>
          <p>Lecturers: {facultyStats.FBMG.lecturers}</p>
          <p>Students: {facultyStats.FBMG.students}</p>
        </div>

        <div className="dashboard-card">
          <h3>FABE</h3>
          <p>Reports: {facultyStats.FABE.reports}</p>
          <p>Lecturers: {facultyStats.FABE.lecturers}</p>
          <p>Students: {facultyStats.FABE.students}</p>
        </div>

        <div className="dashboard-card">
          <h3>Faculty Management</h3>
          <p>Oversee all faculty operations and resolve PL complaints</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Faculty Overview</h3>
        <p style={{ color: '#ccc' }}>
          As Faculty Management, you have oversight of all three faculties. 
          You can monitor reporting activities, resolve complaints against Program Leaders,
          and ensure the smooth operation of the reporting system across all departments.
        </p>
      </div>
    </div>
  );
};

export default FMGDashboard;