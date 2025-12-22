// client/src/pages/LikedSongsPage.jsx
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getLikedSongs } from "../apis/apiFunctions";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import { useSharedPlayer } from "../context/PlayerContext";
import "../assets/styles/PlaylistMainInfo.css"; 
import { Skeleton } from "@mui/material";

// ... LikedSongsHeader component (remains same) ...
function LikedSongsHeader({ songCount }) {
  return (
    <div className="mainInfo-1" style={{ background: "linear-gradient(135deg, #450af5, #c4efd9)" }}>
      <div 
        style={{
            width: "clamp(150px, 30vw, 230px)",
            height: "clamp(150px, 30vw, 230px)",
            background: "linear-gradient(135deg, #2e05a3, #8a88c4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            boxShadow: "0 4px 60px rgba(0,0,0,0.5)"
        }}
      >
        <i className="fa-solid fa-heart" style={{ fontSize: "clamp(4rem, 8vw, 6rem)", color: "white" }}></i>
      </div>

      <div className="name-stat-1" style={{ alignItems: "flex-start", textAlign: "left" }}>
        <p style={{ fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase" }}>Playlist</p>
        <h1 
            style={{ 
                fontSize: "clamp(2.5rem, 6vw, 6rem)", 
                fontWeight: "900", 
                margin: "0.5rem 0",
                lineHeight: "1"
            }}
        >
            Liked Songs
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginTop: "1rem" }}>
           Your personal collection of favorites • {songCount} songs
        </p>
      </div>
    </div>
  );
}

export default function LikedSongsPage({ setPlayerMeta, setTrackInfo }) {
  const { setLikedSongs } = useSharedPlayer();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["likedSongsPage"],
    queryFn: getLikedSongs,
    staleTime: 5 * 60 * 1000, 
  });

  useEffect(() => {
    // 1. Sync global liked songs state (for hearts)
    if (data?.likedSongs) {
      setLikedSongs(data.likedSongs);
    }
    // 2. NEW: Set currPlaylistId for the Queue System
    if (data?.currPlaylistId) {
      window.sessionStorage.setItem("currPlaylistId", data.currPlaylistId);
    }
  }, [data, setLikedSongs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tracks = data?.items || [];

  return (
    <div className="page-container" style={{ paddingBottom: "6rem" }}>
      <Helmet>
        <title>Liked Songs - Beatyx</title>
      </Helmet>

      {/* Hero Section */}
      {isLoading ? (
        <div className="mainInfo-1" style={{ padding: "2rem" }}>
             <Skeleton variant="rectangular" width={200} height={200} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }} />
             <div style={{ marginLeft: "2rem", width: "50%" }}>
                <Skeleton width="40%" height={40} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                <Skeleton width="80%" height={80} sx={{ bgcolor: "rgba(255,255,255,0.1)", marginTop: "1rem" }} />
             </div>
        </div>
      ) : (
        <LikedSongsHeader songCount={tracks.length} />
      )}

      {/* Track List */}
      <div style={{ padding: "0 1rem", marginTop: "2rem" }}>
        {isLoading ? (
             Array.from({ length: 5 }).map((_, i) => (
                 <Skeleton key={i} height={60} sx={{ bgcolor: "rgba(255,255,255,0.05)", marginBottom: "0.5rem", borderRadius: "4px" }} />
             ))
        ) : tracks.length > 0 ? (
            <PlaylistTrackList
                data={tracks}
                isPlaylist={true} // Essential: tells Card to use index/queue logic
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
            />
        ) : (
            <div style={{ textAlign: "center", marginTop: "4rem", color: "#b3b3b3" }}>
                <i className="fa-regular fa-heart" style={{ fontSize: "3rem", marginBottom: "1rem" }}></i>
                <h3>No liked songs yet</h3>
                <p>Songs you like will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}