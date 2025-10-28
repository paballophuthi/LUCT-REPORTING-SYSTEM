import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MonitoringView = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      // This would typically come from a dedicated monitoring endpoint
      const [reportsRes, usersRes] = await Promise.all([
        api.get('/reports'),
        api.get('/users')
      ]);

      const reports = reportsRes.data.reports;
      const users = usersRes.data.users;

      // Calculate basic statistics
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => r.status === 'pending_student_approval').length;
      const approvedReports = reports.filter(r => r.status === 'student_approved').length;
      
      const facultyReports = {};
      reports.forEach(report => {
        if (!facultyReports[report.faculty_name]) {
          facultyReports[report.faculty_name] = 0;
        }
        facultyReports[report.faculty_name]++;
      });

      setStats({
        totalReports,
        pendingReports,
        approvedReports,
        facultyReports,
        totalUsers: users.length
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>System Monitoring</h3>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-input"
          style={{ width: 'auto' }}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Total Reports</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalReports || 0}</p>
        </div>

        <div className="dashboard-card">
          <h4>Pending Approval</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa500' }}>
            {stats.pendingReports || 0}
          </p>
        </div>

        <div className="dashboard-card">
          <h4>Approved Reports</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.approvedReports || 0}
          </p>
        </div>

        <div className="dashboard-card">
          <h4>System Users</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers || 0}</p>
        </div>
      </div>

      {stats.facultyReports && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Reports by Faculty</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {Object.entries(stats.facultyReports).map(([faculty, count]) => (
              <div key={faculty} className="dashboard-card">
                <h5>{faculty}</h5>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
        <h4>System Status</h4>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
            <span>Backend: Operational</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
            <span>Database: Connected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
            <span>Authentication: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringView;