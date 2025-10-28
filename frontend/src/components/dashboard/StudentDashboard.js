import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(user.class_id || '');

  useEffect(() => {
    fetchReports();
  }, [selectedClass]);

  const fetchReports = async () => {
    try {
      // In a real app, this would filter by class
      const response = await api.get('/reports');
      setReports(response.data.reports.filter(report => 
        report.status === 'pending_student_approval'
      ));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignReport = async (reportId) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status: 'student_approved' });
      alert('Report signed successfully!');
      fetchReports();
    } catch (error) {
      alert('Error signing report: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Pending Signatures</h3>
          <p>Reports waiting for your approval: {reports.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>My Class</h3>
          <p>Currently representing: {user.class_id || 'Not assigned'}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Reports Pending Signature</h3>
        
        {reports.length === 0 ? (
          <p style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
            No reports pending your signature.
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Lecturer</th>
                  <th>Students Present</th>
                  <th>Topic</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.course_name} ({report.course_code})</td>
                    <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                    <td>{report.lecturer_name}</td>
                    <td>{report.students_present}/{report.total_students}</td>
                    <td>{report.topic_taught.substring(0, 50)}...</td>
                    <td>
                      <button 
                        onClick={() => handleSignReport(report.id)}
                        className="btn btn-primary"
                      >
                        Sign & Approve
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

export default StudentDashboard;