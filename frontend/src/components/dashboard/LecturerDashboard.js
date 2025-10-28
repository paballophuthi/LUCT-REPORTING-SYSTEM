import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LectureReportForm from '../reports/LectureReportForm';


const LecturerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingApproval: 0,
    approved: 0
  });

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const response = await api.get('/reports/my-reports');
      const myReports = response.data.reports;
      setReports(myReports);
      
      setStats({
        totalReports: myReports.length,
        pendingApproval: myReports.filter(r => r.status === 'pending_student_approval').length,
        approved: myReports.filter(r => r.status === 'student_approved').length
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReportCreated = () => {
    setShowForm(false);
    fetchMyReports();
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Reports</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalReports}</p>
        </div>

        <div className="dashboard-card">
          <h3>Pending Student Approval</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa500' }}>
            {stats.pendingApproval}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Approved Reports</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.approved}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>New Report</h3>
          <p>Submit a new lecture report</p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Create Report
          </button>
        </div>
      </div>

      {showForm ? (
        <LectureReportForm 
          onCancel={() => setShowForm(false)}
          onSuccess={handleReportCreated}
        />
      ) : (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>My Recent Reports</h3>
          
          {reports.length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
              No reports submitted yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 5).map(report => (
                    <tr key={report.id}>
                      <td>{report.course_name}</td>
                      <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                      <td>{report.class_name}</td>
                      <td>{report.students_present}/{report.total_students}</td>
                      <td>
                        <span className={`status-badge status-${report.status.replace('_', '-')}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;