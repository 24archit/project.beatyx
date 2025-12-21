import React from "react";
import "../assets/styles/CategoryPills.css";
import { Link } from "react-router-dom";

// Added "Made For You" as the first item
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
  // If 'categories' prop is passed (connected), use it. 
  // Otherwise use DEFAULT_CATEGORIES (disconnected).
  const isConnected = categories && categories.length > 0;
  const dataToDisplay = isConnected ? categories : DEFAULT_CATEGORIES;

  const handleConnectAlert = (e) => {
    e.preventDefault();
    // You can replace this alert with a function to open your Login/Connect Modal if you have one available in context
    alert("Please connect your Spotify account to access personalized 'Made For You' content.");
  };

  return (
    <div className="category-pills-wrapper">
      <div className="category-pills-container">
        {dataToDisplay.map((cat) => {
          // Special logic for "Made For You" when NOT connected
          if (cat.id === "made-for-you" && !isConnected) {
            return (
              <div 
                key={cat.id} 
                className="category-pill-link" 
                onClick={handleConnectAlert}
                style={{ cursor: "pointer" }}
              >
                <div className="category-pill" style={{ border: "1px solid #1db954", color: "#1db954" }}>
                  <i className="fa-brands fa-spotify" style={{ marginRight: "6px" }}></i>
                  {cat.name}
                </div>
              </div>
            );
          }

          // Standard Category Link
          return (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`} 
              className="category-pill-link"
            >
              <div className="category-pill">
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