// client/src/pages/TrackPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrackInfo, getAudioLink } from "../apis/apiFunctions";
import { TrackMainInfo, TrackMainInfoLoad } from "../components/TrackMainInfo";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import defaultProfilePic from "/profile-pic.webp";
import { Helmet } from "react-helmet-async";
import "../assets/styles/ArtistPage.css";
import { useSharedPlayer } from "../context/PlayerContext";

export default function TrackPage() {
  const { id } = useParams();
  const [isPlayLoading, setIsPlayLoading] = useState(false);

  // Access global player state
  const { 
    trackInfo: currentTrackInfo, 
    playing, 
    togglePlayPause, 
    setUrl, 
    setTrackInfo, 
    setPlaying 
  } = useSharedPlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Caching Configuration added here
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["track", id],
    queryFn: () => getTrackInfo(id),
    retry: 2,                      // Retry twice on failure
    staleTime: 15 * 60 * 1000,     // Cache data for 15 minutes
    refetchOnWindowFocus: false,   // Don't refetch when switching tabs
  });

  const trackData = data?.track;
  const recommendations = data?.recommendations;

  const isCurrentTrackLoaded = currentTrackInfo?.trackName === trackData?.name; 

  const handlePlayBtn = async () => {
    if (isCurrentTrackLoaded) {
      togglePlayPause();
    } else {
      try {
        setIsPlayLoading(true);
        const audioData = await getAudioLink(trackData.id);
        const url = audioData?.url || "";
        
        if (url) {
          const newTrackInfo = {
            id: trackData.id,
            trackName: trackData.name,
            imgSrc: trackData.album.images[0]?.url || defaultProfilePic,
            artistNames: trackData.artists.map(a => a.name),
          };

          setTrackInfo(newTrackInfo);
          setUrl(url);
          setTimeout(() => setPlaying(true), 100);
        } else {
          alert("Audio not available");
        }
      } catch (error) {
        console.error("Error playing track:", error);
        alert("Failed to load audio");
      } finally {
        setIsPlayLoading(false);
      }
    }
  };

  // Retry fallback
  if (isError) {
    return (
      <div className="artist-page-bg">
        <h2 style={{ color: "white", textAlign: "center", paddingTop: "2rem" }}>
          Failed to load track.{" "}
          <button onClick={refetch} style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
            Retry
          </button>
        </h2>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{trackData ? `${trackData.name} | Beatyx` : "Track | Beatyx"}</title>
      </Helmet>

      <div className="artist-page-bg">
        {isLoading || !trackData ? (
          <>
            <TrackMainInfoLoad />
            <div style={{ marginTop: "2rem" }}>
               <TrackMainInfoLoad /> 
            </div>
          </>
        ) : (
          <>
            <TrackMainInfo
              trackName={trackData.name}
              artists={trackData.artists}
              albumName={trackData.album.name}
              releaseDate={trackData.album.release_date}
              img={trackData.album.images[0]?.url || defaultProfilePic}
            />

            {/* Play Button Container */}
            <div className="track-play-container">
                <button 
                  className="btn selected" 
                  onClick={handlePlayBtn}
                  disabled={isPlayLoading}
                  style={{
                    borderRadius: "50%", 
                    width: "3.5rem", 
                    height: "3.5rem", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    padding: 0,
                    fontSize: "1.2rem"
                  }}
                >
                  {isPlayLoading ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className={`fa-solid ${isCurrentTrackLoaded && playing ? "fa-pause" : "fa-play"}`}></i>
                  )}
                </button>
            </div>
            
            <div style={{ padding: "0 1rem" }}>
                <h3 style={{ color: "white", marginTop: "2rem", marginBottom: "1rem" }}>
                    Recommended Tracks
                </h3>
            </div>

            <PlaylistTrackList
              data={recommendations}
              isPlaylist={true}
              setPlayerMeta={setUrl}
              setTrackInfo={setTrackInfo}
            />
          </>
        )}
      </div>
    </>
  );
}