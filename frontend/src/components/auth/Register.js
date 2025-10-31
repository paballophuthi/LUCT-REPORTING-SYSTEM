import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/api'; // ✅ import api directly

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const result = await registerUser(submitData);

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
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        {/* Role */}
        <div className="form-group">
          <label className="form-label">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="student">Class Representative</option>
            <option value="lecturer">Lecturer</option>
            <option value="prl">Principal Lecturer (PRL)</option>
            <option value="pl">Program Leader (PL)</option>
            <option value="fmg">Faculty Management (FMG)</option>
          </select>
        </div>

        {/* Faculty */}
        <div className="form-group">
          <label className="form-label">Faculty</label>
          <select name="faculty" value={formData.faculty} onChange={handleChange} required>
            <option value="FICT">FICT - ICT</option>
            <option value="FBMG">FBMG - Business</option>
            <option value="FABE">FABE - Architecture</option>
          </select>
        </div>

        {/* Program */}
        <div className="form-group">
          <label className="form-label">Program</label>
          <input type="text" name="program" value={formData.program} onChange={handleChange} />
        </div>

        {/* Class ID */}
        <div className="form-group">
          <label className="form-label">Class ID</label>
          <input type="text" name="class_id" value={formData.class_id} onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
