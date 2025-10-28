import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-tab active' : 'nav-tab';
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="nav-tabs">
      <Link to="/dashboard" className={isActive('/dashboard')}>
        Dashboard
      </Link>
      
      <Link to="/reports" className={isActive('/reports')}>
        Reports
      </Link>
      
      <Link to="/complaints" className={isActive('/complaints')}>
        Complaints
      </Link>
      
      {['prl', 'pl', 'fmg'].includes(user.role) && (
        <Link to="/monitoring" className={isActive('/monitoring')}>
          Monitoring
        </Link>
      )}
    </nav>
  );
};

export default Navigation;