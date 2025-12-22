// client/src/pages/CategoryPage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; 
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getCategoryPlaylists } from "../apis/apiFunctions";
import { SectionCard, SectionCardLoad } from "../components/SectionCard";
import "../assets/styles/Section.css";
import "../assets/styles/CategoryPage.css"; 

export default function CategoryPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  // 1. Determine Title
  let displayName;
  if (location.state && location.state.categoryName) {
    displayName = location.state.categoryName;
  } else {
    displayName = id.charAt(0).toUpperCase() + id.slice(1);
  }

  // 2. Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ["categoryPlaylists", id],
    queryFn: () => getCategoryPlaylists(id),
    select: (data) => {
      if (!data || !data.playlists || !data.playlists.items) return [];
      return data.playlists.items;
    },
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 3. Filter Valid Playlists
  const validPlaylists = data 
    ? data.filter(item => {
        if (!item || !item.id) return false;
        // Optional: Keep the check for empty playlists to keep UI clean
        if (item.tracks?.total === 0) return false; 
        return true;
      })
    : [];

  const isEmpty = !isLoading && validPlaylists.length === 0;

  return (
    <div className="page-container">
      <Helmet>
        <title>{displayName} - Beatyx</title>
      </Helmet>

      {/* Hero Header */}
      <div className="category-hero">
        
        
        <div className="category-header-content">
          <div className="category-label">Browse</div>
          <h1 className="category-title">{displayName}</h1>
          <p className="category-subtitle">
             The best curated playlists for {displayName}. Handpicked for your mood.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid-wrapper">
        <div className="grid-container">
          
          {isLoading && Array.from({ length: 8 }).map((_, i) => <SectionCardLoad key={i} />)}

          {!isLoading && validPlaylists.map((item) => (
            <SectionCard
              key={item.id}
              imgSrc={item.images?.[0]?.url}
              cardName={item.name}
              cardId={item.id}
              cardType="playlist"
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
              cardStat={
                <span 
                  className="card-stat-text" 
                  dangerouslySetInnerHTML={{ __html: item.description || `By ${item.owner?.display_name || 'Spotify'}` }} 
                  style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                    fontSize: '0.75rem',
                    color: '#a0a0a0'
                  }}
                />
              }
              spotifyUrl={item.external_urls?.spotify}
            />
          ))}
              
          {isEmpty && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "3rem", padding: "0 1rem" }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#2979ff" }}></i>
              <p style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "600" }}>No playlists found.</p>
              <p style={{ color: "#a0a0a0" }}>This category appears to be empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}