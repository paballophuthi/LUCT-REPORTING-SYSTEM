import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2d2d2d',
      padding: '1rem 2rem',
      borderTop: '1px solid #444',
      marginTop: '2rem',
      textAlign: 'center',
      color: '#ccc'
    }}>
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} Limkokwing University of Creative Technology - Lesotho. 
          All rights reserved.
        </p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Reporting System v1.0 | Faculty of Information Communication Technology
        </p>
      </div>
    </footer>
  );
};

export default Footer;