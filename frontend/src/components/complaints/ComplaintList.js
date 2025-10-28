import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ComplaintList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('my-complaints');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  const fetchComplaints = async () => {
    try {
      let endpoint = '';
      if (activeTab === 'my-complaints') {
        endpoint = '/complaints/my-complaints';
      } else if (['prl', 'pl', 'fmg'].includes(user.role)) {
        endpoint = '/complaints/for-review';
      }

      if (endpoint) {
        const response = await api.get(endpoint);
        setComplaints(response.data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'in_review': return '#007bff';
      case 'resolved': return '#28a745';
      case 'dismissed': return '#dc3545';
      default: return '#ccc';
    }
  };

  const viewComplaintDetails = async (complaintId) => {
    try {
      const [complaintRes, responsesRes] = await Promise.all([
        api.get(`/complaints/${complaintId}`),
        api.get(`/complaints/${complaintId}/responses`)
      ]);

      setSelectedComplaint({
        ...complaintRes.data,
        responses: responsesRes.data.responses
      });
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('my-complaints')}
          className={`btn ${activeTab === 'my-complaints' ? 'btn-primary' : 'btn-secondary'}`}
        >
          My Complaints
        </button>
        
        {['prl', 'pl', 'fmg'].includes(user.role) && (
          <button 
            onClick={() => setActiveTab('for-review')}
            className={`btn ${activeTab === 'for-review' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Complaints for Review
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Against</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id}>
                <td>
                  <strong>{complaint.title}</strong>
                  <br />
                  <small style={{ color: '#ccc' }}>
                    {complaint.description.substring(0, 50)}...
                  </small>
                </td>
                <td>
                  {complaint.against_user_name || complaint.against_role}
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {complaint.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: complaint.priority === 'urgent' ? '#dc3545' : 
                           complaint.priority === 'high' ? '#ffa500' : '#28a745'
                  }}>
                    {complaint.priority}
                  </span>
                </td>
                <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => viewComplaintDetails(complaint.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {complaints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
            No complaints found.
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Complaint Details</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Title:</strong> {selectedComplaint.title}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Description:</strong>
              <p style={{ color: '#ccc', marginTop: '0.5rem' }}>{selectedComplaint.description}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Status:</strong>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(selectedComplaint.status),
                  marginLeft: '0.5rem'
                }}
              >
                {selectedComplaint.status}
              </span>
            </div>

            {selectedComplaint.responses && selectedComplaint.responses.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Responses:</strong>
                {selectedComplaint.responses.map(response => (
                  <div key={response.id} style={{
                    backgroundColor: '#1a1a1a',
                    padding: '1rem',
                    borderRadius: '4px',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {response.responder_name} ({response.responder_role})
                    </div>
                    <div style={{ color: '#ccc', marginTop: '0.5rem' }}>
                      {response.response_text}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>
                      {new Date(response.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setSelectedComplaint(null)}
              className="btn btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;