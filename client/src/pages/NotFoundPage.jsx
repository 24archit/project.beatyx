import React from "react";
import "../assets/styles/NotFoundPage.css";
import { Helmet } from "react-helmet-async";
const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Not Found - 404</title>
      </Helmet>
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-heading">Oops! Page Not Found</h1>
          <p className="not-found-description">
            The page you're looking for doesn't exist.
          </p>
          <p className="not-found-subheading">
            Let's get you back to the music!
          </p>
          <button
            className="back-home-btn"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
