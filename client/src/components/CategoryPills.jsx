// client/src/components/CategoryPills.jsx
import React from "react";
import "../assets/styles/CategoryPills.css";
import { Link } from "react-router-dom";

// Standard defaults
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
  const isConnected = categories && categories.length > 0;

  // LOGIC FIX:
  // 1. If connected, take fetched categories.
  // 2. Filter out "made-for-you" if Spotify ever sends it (to avoid dupes).
  // 3. Prepend our custom "Made For You" pill.
  let dataToDisplay;
  if (isConnected) {
    const filtered = categories.filter(c => c.id !== "made-for-you");
    dataToDisplay = [{ id: "made-for-you", name: "Made For You" }, ...filtered];
  } else {
    dataToDisplay = DEFAULT_CATEGORIES;
  }

  const handleConnectAlert = (e) => {
    e.preventDefault();
    alert("Please connect your Spotify account to access personalized 'Made For You' content.");
  };

  return (
    <div className="category-pills-wrapper">
      <div className="category-pills-container">
        {dataToDisplay.map((cat) => {
          const isMadeForYou = cat.id === "made-for-you";
          
          // Green Style for Made For You
          const greenStyle = isMadeForYou ? { 
            border: "1px solid #1db954", 
            color: "#1db954",
            backgroundColor: "rgba(29, 185, 84, 0.1)"
          } : {};

          // CASE 1: "Made For You" AND NOT CONNECTED -> Click Alert
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

          // CASE 2: Everything else (Connected Made For You + Normal Categories)
          return (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`} 
              className="category-pill-link"
            >
              <div className="category-pill" style={greenStyle}>
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