import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RatingSystem = ({ entityType, entityId, currentRating = null }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(currentRating?.rating_value || 0);
  const [comment, setComment] = useState(currentRating?.comment || '');
  const [submitted, setSubmitted] = useState(!!currentRating);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/ratings', {
        rated_entity_type: entityType,
        rated_entity_id: entityId,
        rating_value: rating,
        comment: comment
      });

      setSubmitted(true);
      alert('Rating submitted successfully!');
    } catch (error) {
      alert('Error submitting rating: ' + error.response?.data?.error);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#28a745', 
        color: 'white',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        ✓ Thank you for your rating!
      </div>
    );
  }

  return (
    <div className="card">
      <h4>Rate this {entityType}</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: star <= rating ? '#ffa500' : '#666'
                }}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <div style={{ color: '#ccc', fontSize: '0.875rem' }}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Comment (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-input"
            rows="3"
            placeholder="Share your feedback..."
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={rating === 0}
        >
          Submit Rating
        </button>
      </form>
    </div>
  );
};

export default RatingSystem;