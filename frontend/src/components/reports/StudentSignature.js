import React, { useRef, useState } from 'react';
import api from '../../services/api';

const StudentSignature = ({ reportId, onSigned }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL(); // Convert canvas to base64
    
    if (signatureData === canvas.toDataURL()) { // Check if canvas is empty
      alert('Please provide your signature first');
      return;
    }

    try {
      await api.post('/reports/signature', {
        report_id: reportId,
        signature_data: signatureData
      });
      
      setHasSigned(true);
      onSigned();
      alert('Signature submitted successfully! Report sent to PRL for review.');
    } catch (error) {
      alert('Error submitting signature: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="card">
      <h3>Digital Signature</h3>
      <p style={{ color: '#ccc', marginBottom: '1rem' }}>
        Please provide your signature using your mouse or touch screen to approve this report.
      </p>

      <div style={{ border: '2px solid #555', borderRadius: '4px', marginBottom: '1rem' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            width: '100%', 
            height: '200px', 
            cursor: 'crosshair',
            backgroundColor: '#1a1a1a',
            display: 'block'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={clearSignature}
          className="btn btn-secondary"
        >
          Clear Signature
        </button>
        
        <button 
          onClick={submitSignature}
          className="btn btn-primary"
          disabled={hasSigned}
        >
          {hasSigned ? 'Signed ✓' : 'Submit Signature'}
        </button>
      </div>

      {hasSigned && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#28a745', 
          color: 'white',
          borderRadius: '4px'
        }}>
          ✓ Report signed successfully and forwarded to PRL for review.
        </div>
      )}
    </div>
  );
};

export default StudentSignature;