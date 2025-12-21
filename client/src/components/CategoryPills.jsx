// client/src/components/CategoryPills.jsx
import React from "react";
import "../assets/styles/CategoryPills.css";
import { Link } from "react-router-dom";

const DEFAULT_CATEGORIES = [
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

  // Simple Logic: Use fetched categories if connected, otherwise defaults.
  // No filtering or injecting "Made For You".
  const dataToDisplay = isConnected ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="category-pills-wrapper">
      <div className="category-pills-container">
        {dataToDisplay.map((cat) => (
          <Link 
            key={cat.id} 
            to={`/category/${cat.id}`}
            state={{ categoryName: cat.name }} 
            className="category-pill-link"
          >
            <div className="category-pill">
               {cat.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="category-fade-right"></div>
    </div>
  );
}