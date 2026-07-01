import React from 'react';

export function AnimatedWave({ playing }) {
  if (!playing) return null;

  return (
    <div className="animated-wave" aria-label="Music Wave">
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
    </div>
  );
}
