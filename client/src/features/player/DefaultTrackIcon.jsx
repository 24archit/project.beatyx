import React from 'react';

export function DefaultTrackIcon() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f1f2e 0%, #11111a 100%)',
      color: '#ffffff',
      opacity: 0.9,
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
    }}>
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    </div>
  );
}
