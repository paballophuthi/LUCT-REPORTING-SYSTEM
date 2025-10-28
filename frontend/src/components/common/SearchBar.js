import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: '2.5rem' }}
      />
      <span style={{
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#888'
      }}>
        🔍
      </span>
    </div>
  );
};

export default SearchBar;