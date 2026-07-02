// client/src/components/CategoryPills.jsx
import { useRef, useEffect } from "react";
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
  const dataToDisplay = isConnected ? categories : DEFAULT_CATEGORIES;
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="category-pills-wrapper">
      <div className="category-pills-container" ref={containerRef}>
        {dataToDisplay.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            state={{ categoryName: cat.name }}
            className="category-pill-link"
          >
            <div className="category-pill">{cat.name}</div>
          </Link>
        ))}
      </div>
      <div className="category-fade-right"></div>
    </div>
  );
}
