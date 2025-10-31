import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    faculty: 'FICT',
    program: '',
    class_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Prepare data for registration
    const { confirmPassword, ...submitData } = formData;

    const result = await register(submitData);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p>Join the LUCT Reporting System today</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-input"
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="form-input"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="form-input"
                placeholder="Create a password (min. 6 characters)"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className="form-input"
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="form-input" 
                required
                disabled={loading}
              >
                <option value="student">Class Representative</option>
                <option value="lecturer">Lecturer</option>
                <option value="prl">Principal Lecturer (PRL)</option>
                <option value="pl">Program Leader (PL)</option>
                <option value="fmg">Faculty Management (FMG)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Faculty *</label>
              <select 
                name="faculty" 
                value={formData.faculty} 
                onChange={handleChange} 
                className="form-input" 
                required
                disabled={loading}
              >
                <option value="FICT">FICT - Faculty of ICT</option>
                <option value="FBMG">FBMG - Faculty of Business</option>
                <option value="FABE">FABE - Faculty of Architecture</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Program</label>
              <input 
                type="text" 
                name="program" 
                value={formData.program} 
                onChange={handleChange} 
                className="form-input"
                placeholder="e.g., BSc Computer Science"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Class ID</label>
              <input 
                type="text" 
                name="class_id" 
                value={formData.class_id} 
                onChange={handleChange} 
                className="form-input"
                placeholder="e.g., CS2024A"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/login" className="auth-link">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;