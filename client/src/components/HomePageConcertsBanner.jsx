import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/HomePageConcertsBanner.css";

export default function HomePageConcertsBanner() {
  const navigate = useNavigate();

  return (
    <div className="hcb-banner">
      <div className="hcb-left">
        <div className="hcb-icon">
          <i className="fa-solid fa-ticket" />
        </div>
        <div className="hcb-text">
          <h2>Discover Live Concerts</h2>
          <p>Find upcoming shows worldwide, powered by Ticketmaster</p>
        </div>
      </div>
      <button className="hcb-btn" onClick={() => navigate("/concerts")}>
        <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
        Explore Events
      </button>
    </div>
  );
}
