import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ComplaintForm = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    against_user_id: '',
    against_role: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Determine which users can be complained against based on current user role
      let againstRole = '';
      switch (user.role) {
        case 'student': againstRole = 'lecturer'; break;
        case 'lecturer': againstRole = 'prl'; break;
        case 'prl': againstRole = 'pl'; break;
        case 'pl': againstRole = 'fmg'; break;
        default: againstRole = '';
      }

      if (againstRole) {
        const response = await api.get(`/users/role/${againstRole}?faculty=${user.faculty}`);
        setUsers(response.data.users);
        
        // Set default against_role
        setFormData(prev => ({ ...prev, against_role: againstRole }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/complaints', formData);
      alert('Complaint submitted successfully! It has been routed to the appropriate authority.');
      onSuccess();
    } catch (error) {
      alert('Error submitting complaint: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const getComplaintInstructions = () => {
    switch (user.role) {
      case 'student':
        return 'Complaints about lecturers will be sent to your faculty PRL. The lecturer will not see this complaint.';
      case 'lecturer':
        return 'Complaints about PRLs will be sent to your Program Leader. The PRL will not see this complaint.';
      case 'prl':
        return 'Complaints about Program Leaders will be sent to Faculty Management. The PL will not see this complaint.';
      case 'pl':
        return 'Complaints about Faculty Management will be handled at the institutional level.';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <h2>Submit Complaint</h2>
      
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1rem',
        borderLeft: '4px solid #ffa500'
      }}>
        <strong>Privacy Notice:</strong> {getComplaintInstructions()}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Complaint Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows="5"
            placeholder="Provide detailed information about the issue..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {user.role === 'student' ? 'Lecturer' : 
             user.role === 'lecturer' ? 'Principal Lecturer (PRL)' :
             user.role === 'prl' ? 'Program Leader (PL)' : 'Faculty Management (FMG)'}
          </label>
          <select
            name="against_user_id"
            value={formData.against_user_id}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select {formData.against_role?.toUpperCase()}</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <input
          type="hidden"
          name="against_role"
          value={formData.against_role}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;