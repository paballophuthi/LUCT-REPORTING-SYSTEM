import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StudentSignature from './StudentSignature';

const ReportView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await api.get(`/reports/${id}`);
      setReport(response.data.report);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSuccess = () => {
    setShowSignature(false);
    fetchReport(); // Refresh report data
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card">
        <h2>Report Not Found</h2>
        <p>The requested report could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h2>Lecture Report Details</h2>
          <div>
            <span className={`status-badge status-${report.status.replace('_', '-')}`}>
              {report.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Basic Information */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
              Basic Information
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong>Faculty:</strong>
                <div style={{ color: '#ccc' }}>{report.faculty_name}</div>
              </div>
              
              <div>
                <strong>Class:</strong>
                <div style={{ color: '#ccc' }}>{report.class_name}</div>
              </div>
              
              <div>
                <strong>Week of Reporting:</strong>
                <div style={{ color: '#ccc' }}>{report.week_of_reporting}</div>
              </div>
              
              <div>
                <strong>Date of Lecture:</strong>
                <div style={{ color: '#ccc' }}>
                  {new Date(report.date_of_lecture).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
              Course Information
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong>Course Name:</strong>
                <div style={{ color: '#ccc' }}>{report.course_name}</div>
              </div>
              
              <div>
                <strong>Course Code:</strong>
                <div style={{ color: '#ccc' }}>{report.course_code}</div>
              </div>
              
              <div>
                <strong>Lecturer:</strong>
                <div style={{ color: '#ccc' }}>{report.lecturer_name}</div>
              </div>
              
              <div>
                <strong>Venue:</strong>
                <div style={{ color: '#ccc' }}>{report.venue}</div>
              </div>
              
              <div>
                <strong>Scheduled Time:</strong>
                <div style={{ color: '#ccc' }}>{report.scheduled_time}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
            Attendance
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <strong>Students Present:</strong>
              <div style={{ 
                color: '#fff', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: report.students_present / report.total_students >= 0.7 ? '#28a745' : '#ffa500'
              }}>
                {report.students_present}
              </div>
            </div>
            
            <div>
              <strong>Total Registered:</strong>
              <div style={{ color: '#ccc', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {report.total_students}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <strong>Attendance Rate:</strong>
            <div style={{ color: '#ccc' }}>
              {((report.students_present / report.total_students) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Academic Content */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
            Academic Content
          </h3>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <strong>Topic Taught:</strong>
              <div style={{ 
                color: '#ccc', 
                backgroundColor: '#2a2a2a', 
                padding: '1rem', 
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                {report.topic_taught}
              </div>
            </div>
            
            <div>
              <strong>Learning Outcomes:</strong>
              <div style={{ 
                color: '#ccc', 
                backgroundColor: '#2a2a2a', 
                padding: '1rem', 
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                {report.learning_outcomes}
              </div>
            </div>
            
            {report.recommendations && (
              <div>
                <strong>Lecturer's Recommendations:</strong>
                <div style={{ 
                  color: '#ccc', 
                  backgroundColor: '#2a2a2a', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                  borderLeft: '4px solid #ffa500'
                }}>
                  {report.recommendations}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Signature Section */}
        {user.role === 'student' && report.status === 'pending_student_approval' && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
              Student Approval
            </h3>
            
            {!showSignature ? (
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '1.5rem', 
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                  As the class representative, please review this report and provide your digital signature to confirm:
                </p>
                <ul style={{ textAlign: 'left', color: '#ccc', marginBottom: '1.5rem' }}>
                  <li>The topics listed were actually taught</li>
                  <li>The attendance figures are accurate</li>
                  <li>You approve this report to be sent to the PRL</li>
                </ul>
                <button 
                  onClick={() => setShowSignature(true)}
                  className="btn btn-primary"
                >
                  Provide Digital Signature
                </button>
              </div>
            ) : (
              <StudentSignature 
                reportId={report.id}
                onSigned={handleSignatureSuccess}
              />
            )}
          </div>
        )}

        {/* PRL Action Section */}
        {user.role === 'prl' && report.status === 'student_approved' && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
              PRL Review
            </h3>
            
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '1.5rem', 
              borderRadius: '4px'
            }}>
              <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                This report has been approved by the class representative. Please review and approve it to complete the process.
              </p>
              
              <button 
                onClick={async () => {
                  try {
                    await api.patch(`/reports/${report.id}/status`, { status: 'prl_reviewed' });
                    alert('Report approved successfully!');
                    fetchReport();
                  } catch (error) {
                    alert('Error approving report: ' + error.response?.data?.error);
                  }
                }}
                className="btn btn-primary"
              >
                Approve Report
              </button>
            </div>
          </div>
        )}

        {/* Report Metadata */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#888'
        }}>
          <strong>Report Metadata:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div>Created: {new Date(report.created_at).toLocaleString()}</div>
            <div>Last Updated: {new Date(report.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;