import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ComplaintResponse = ({ complaintId, onResponseSubmitted }) => {
  const { user } = useAuth();
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/complaints/${complaintId}/response`, {
        response_text: responseText
      });
      
      alert('Response submitted successfully!');
      setResponseText('');
      onResponseSubmitted();
    } catch (error) {
      alert('Error submitting response: ' + error.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h4>Add Response</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your Response</label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="form-input"
            rows="4"
            placeholder="Enter your response to this complaint..."
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintResponse;