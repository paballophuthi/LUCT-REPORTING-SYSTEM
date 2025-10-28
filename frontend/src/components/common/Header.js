import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo-placeholder">
          <strong>LIMKOKWING LESOTHO</strong>
        </div>
        <div className="system-name">Reporting System</div>
      </div>
      
      <nav>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user.name} ({user.role.toUpperCase()})</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/login" className="btn btn-primary">Login</a>
            <a href="/register" className="btn btn-secondary">Register</a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;