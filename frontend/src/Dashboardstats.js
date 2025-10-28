// components/dashboard/DashboardStats.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import './DashboardStats.css';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalClasses: 0,
    totalFaculties: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalReports: 0,
    totalComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Loading statistics...</div>;
  }

  return (
    <div className="dashboard-stats">
      <h2>System Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalStaff}</h3>
            <p>Total Staff</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-info">
            <h3>{stats.totalClasses}</h3>
            <p>Classes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>{stats.totalFaculties}</h3>
            <p>Faculties</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalCourses}</h3>
            <p>Courses</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Students</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalReports}</h3>
            <p>Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;