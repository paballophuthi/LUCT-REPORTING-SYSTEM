import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ReportList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const endpoint = user.role === 'lecturer' ? '/reports/my-reports' : '/reports';
      const response = await api.get(endpoint);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_student_approval': return '#ffa500';
      case 'student_approved': return '#28a745';
      case 'prl_reviewed': return '#007bff';
      case 'completed': return '#6c757d';
      default: return '#ccc';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Lecture Reports</h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '200px' }}
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="pending_student_approval">Pending Student Approval</option>
            <option value="student_approved">Student Approved</option>
            <option value="prl_reviewed">PRL Reviewed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Lecturer</th>
              <th>Class</th>
              <th>Date</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td>
                  <div>
                    <strong>{report.course_name}</strong>
                    <br />
                    <small style={{ color: '#ccc' }}>{report.course_code}</small>
                  </div>
                </td>
                <td>{report.lecturer_name}</td>
                <td>{report.class_name}</td>
                <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                <td>{report.students_present}/{report.total_students}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(report.status),
                      color: report.status === 'pending_student_approval' ? '#000' : '#fff'
                    }}
                  >
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>{new Date(report.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
            No reports found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;