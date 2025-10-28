import React from 'react';

const DownloadButton = ({ onDownload, children, disabled = false }) => {
  const handleClick = () => {
    if (onDownload && !disabled) {
      onDownload();
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className="btn btn-primary"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1
      }}
    >
      📥 {children || 'Download'}
    </button>
  );
};

export default DownloadButton;