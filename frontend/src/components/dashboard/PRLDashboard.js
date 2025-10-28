import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PRLDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, complaintsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/complaints/for-review')
      ]);
      
      setReports(reportsRes.data.reports);
      setComplaints(complaintsRes.data.complaints);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status: 'prl_reviewed' });
      alert('Report approved successfully!');
      fetchData();
    } catch (error) {
      alert('Error approving report: ' + error.response?.data?.error);
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Reports to Review</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {reports.filter(r => r.status === 'student_approved').length}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Pending Complaints</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa500' }}>
            {complaints.length}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Faculty</h3>
          <p>{user.faculty}</p>
        </div>
      </div>

      {/* Reports Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Reports Awaiting PRL Review</h3>
        
        {reports.filter(r => r.status === 'student_approved').length === 0 ? (
          <p style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
            No reports awaiting review.
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Lecturer</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Attendance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.filter(r => r.status === 'student_approved').map(report => (
                  <tr key={report.id}>
                    <td>{report.course_name}</td>
                    <td>{report.lecturer_name}</td>
                    <td>{report.class_name}</td>
                    <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                    <td>{report.students_present}/{report.total_students}</td>
                    <td>
                      <button 
                        onClick={() => handleApproveReport(report.id)}
                        className="btn btn-primary"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PRLDashboard;