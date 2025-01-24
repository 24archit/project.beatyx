import React from 'react';
import "../assets/styles/NotFoundPage.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-heading">Oops! Page Not Found</h1>
        <p className="not-found-description">The page you're looking for doesn't exist.</p>
        <p className="not-found-subheading">Let's get you back to the music!</p>
        <button className="back-home-btn" onClick={() => window.location.href = '/'}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
