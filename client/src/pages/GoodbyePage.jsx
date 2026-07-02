import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/GoodbyePage.css";
import Logo from "@/components/Logo";

export default function GoodbyePage() {
  return (
    <div className="goodbye-container">
      <div className="goodbye-content">
        <div className="goodbye-logo">
          <Logo />
        </div>
        <h1>We&apos;re sorry to see you go.</h1>
        <p>Your account has been successfully deleted.</p>
        <p>
          All your data, including liked songs and playlists on Beatyx, have been permanently
          removed from our servers.
        </p>
        <Link to="/" className="btn btn-primary go-home-btn">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
