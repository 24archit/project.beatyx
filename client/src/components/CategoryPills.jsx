// client/src/components/CategoryPills.jsx
import React from "react";
import "../assets/styles/CategoryPills.css";
import { Link } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  { id: "made-for-you", name: "Made For You" },
  { id: "toplists", name: "Top Lists" },
  { id: "bollywood", name: "Bollywood" },
  { id: "pop", name: "Pop" },
  { id: "romance", name: "Romance" },
  { id: "punjabi", name: "Punjabi" },
  { id: "party", name: "Party" },
  { id: "devotional", name: "Devotional" },
  { id: "indie_alt", name: "Indie" },
  { id: "workout", name: "Workout" },
  { id: "hiphop", name: "Hip-Hop" },
];

export default function CategoryPills({ categories }) {
  // Check if we are using real data
  const isConnected = categories && categories.length > 0;
  
  // If connected, we prepend "Made For You" to the fetched list
  // If not connected, we use DEFAULT_CATEGORIES (which already has it)
  let dataToDisplay = isConnected 
    ? [{ id: "made-for-you", name: "Made For You" }, ...categories] 
    : DEFAULT_CATEGORIES;

  const handleConnectAlert = (e) => {
    e.preventDefault();
    alert("Please connect your Spotify account to access personalized 'Made For You' content.");
  };

  return (
    <div className="category-pills-wrapper">
      <div className="category-pills-container">
        {dataToDisplay.map((cat) => {
          // Identify if this is the "Made For You" pill
          const isMadeForYou = cat.id === "made-for-you";
          
          // Style Object for Green Pill
          const greenStyle = isMadeForYou ? { 
            border: "1px solid #1db954", 
            color: "#1db954",
            backgroundColor: "rgba(29, 185, 84, 0.1)"
          } : {};

          // Logic for Disconnected State clicking "Made For You"
          if (isMadeForYou && !isConnected) {
            return (
              <div 
                key={cat.id} 
                className="category-pill-link" 
                onClick={handleConnectAlert}
                style={{ cursor: "pointer" }}
              >
                <div className="category-pill" style={greenStyle}>
                  <i className="fa-brands fa-spotify" style={{ marginRight: "6px" }}></i>
                  {cat.name}
                </div>
              </div>
            );
          }

          // Standard Category Link (Works for Connected "Made For You" too)
          return (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`} 
              className="category-pill-link"
            >
              <div className="category-pill" style={greenStyle}>
                 {/* Add icon only for Made For You */}
                 {isMadeForYou && <i className="fa-brands fa-spotify" style={{ marginRight: "6px" }}></i>}
                 {cat.name}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="category-fade-right"></div>
    </div>
  );
}