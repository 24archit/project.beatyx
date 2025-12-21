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
  const isConnected = categories && categories.length > 0;

  let dataToDisplay;
  if (isConnected) {
    // FIX: Filter by Name AND ID to catch Spotify's native "Made For You" category
    const filtered = categories.filter((c) => {
      const name = c.name ? c.name.toLowerCase() : "";
      const id = c.id ? c.id.toLowerCase() : "";
      
      // Return FALSE to remove it if it matches "made for you"
      return name !== "made for you" && id !== "made-for-you";
    });

    // Prepend our custom "Made For You" pill
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
          
          // Style: Always Green for "Made For You"
          const pillStyle = isMadeForYou ? { 
            border: "1px solid #1db954", 
            color: "#1db954",
            backgroundColor: "rgba(29, 185, 84, 0.1)"
          } : {};

          // CASE 1: "Made For You" BUT Disconnected -> Show Alert
          if (isMadeForYou && !isConnected) {
            return (
              <div 
                key={cat.id} 
                className="category-pill-link" 
                onClick={handleConnectAlert}
                style={{ cursor: "pointer" }}
              >
                <div className="category-pill" style={pillStyle}>
                  <i className="fa-brands fa-spotify" style={{ marginRight: "6px" }}></i>
                  {cat.name}
                </div>
              </div>
            );
          }

          // CASE 2: Connected or Standard Category -> Link
          return (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              // Pass the name in state to fix the Header on the next page
              state={{ categoryName: cat.name }} 
              className="category-pill-link"
            >
              <div className="category-pill" style={pillStyle}>
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