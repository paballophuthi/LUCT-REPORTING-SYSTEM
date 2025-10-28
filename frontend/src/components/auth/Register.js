import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    const { confirmPassword, ...submitData } = formData;

    const result = await register(submitData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Register for Reporting System</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="student">Class Representative</option>
            <option value="lecturer">Lecturer</option>
            <option value="prl">Principal Lecturer (PRL)</option>
            <option value="pl">Program Leader (PL)</option>
            <option value="fmg">Faculty Management (FMG)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Faculty</label>
          <select
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="FICT">FICT - Information Communication Technology</option>
            <option value="FBMG">FBMG - Business Management and Governance</option>
            <option value="FABE">FABE - Architecture and Built Environment</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Program</label>
          <input
            type="text"
            name="program"
            value={formData.program}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Diploma in Information Technology"
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
            placeholder="e.g., DIT2023A"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: '#ccc' }}>
        Already have an account? <a href="/login" style={{ color: '#fff' }}>Login here</a>
      </p>
    </div>
  );
};

export default Register;