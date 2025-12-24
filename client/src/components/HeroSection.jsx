// client/src/components/HeroSection.jsx
import "../assets/styles/HeroSection.css"; 
import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";

export default function HeroSection({ data, isLoading }) {
  if (isLoading || !data) {
    return (
      <div className="hero-container loading">
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          animation="wave" 
          sx={{ bgcolor: "rgba(41, 121, 255, 0.1)", borderRadius: "1rem", minHeight: "350px" }} 
        />
      </div>
    );
  }

  // Logic: Prioritize Featured Playlist -> then New Releases
  const heroItem = data[0];
  const image = heroItem.images[0]?.url;
  const name = heroItem.name;
  
  // Handling description safely (sometimes Spotify returns HTML)
  const description = heroItem.description || `By ${heroItem.owner?.display_name || heroItem.artists?.[0]?.name}`;
  
  const id = heroItem.id;
  const type = heroItem.type; // 'playlist' or 'album'

  return (
    <div className="hero-container">
      {/* Background with Blur */}
      <div 
        className="hero-background" 
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      
      <div className="hero-content">
        <div className="hero-image-wrapper">
          <img src={image} alt={name} className="hero-img" />
        </div>
        
        <div className="hero-details">
          <span className="hero-label">FEATURED {type.toUpperCase()}</span>
          <h1 className="hero-title">{name}</h1>
          <p 
            className="hero-description"
            dangerouslySetInnerHTML={{ __html: description }}
          ></p>
          
          <div className="hero-buttons">
            <Link to={`/${type}/${id}`} className="hero-play-btn">
              <i className="fa-solid fa-play"></i> Listen Now
            </Link>
           
          </div>
        </div>
      </div>
    </div>
  );
}