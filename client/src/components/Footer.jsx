import React from "react";
import "../assets/styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo">Beatyx</h2>
          <p>
            Beatyx is more than just a music platform—it’s a journey to
            transform the way playlists are managed, ensuring seamless user
            experiences and innovative features.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#roadmap">Development Journey</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#github">GitHub Repository</a></li>
            <li><a href="#documentation">Documentation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Development Journey</h3>
          <p>
            This project was built using the <strong>MERN stack</strong>
            (MongoDB, Express.js, React, Node.js) and integrated with
            <strong>Spotify’s API</strong> to fetch music data. Every feature was designed to solve real-world problems, from playlist management to intuitive UI.
          </p>
          <div>
            <p>Milestones:</p>
            <ul>
              <li>Phase 1: UI/UX Design with Figma</li>
              <li>Phase 2: Backend API with Node.js & Express</li>
              <li>Phase 3: MongoDB integration for playlists</li>
              <li>Phase 4: Deployment on Vercel</li>
            </ul>
          </div>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:contact@beatyx.com">contact@beatyx.com</a></p>
          <div className="social-media">
            <a href="#linkedin"><i className="fab fa-linkedin-in"></i></a>
            <a href="#github"><i className="fab fa-github"></i></a>
            <a href="#twitter"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Beatyx. Built with passion and love for music</p>
      </div>
    </footer>
  );
};

export default Footer;
