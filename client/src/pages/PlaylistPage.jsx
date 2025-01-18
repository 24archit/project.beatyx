import { PlaylistMainInfo } from "../components/PlaylistMainInfo";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistInfo } from "../apis/apiFunctions.js";
import { Skeleton } from "@mui/material";
import defaultProfilePic from "../assets/media/profile-pic.webp";
import { ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart";
import { ArtistMainInfoLoad } from "../components/ArtistMainInfo";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import React from "react";

export default function PlaylistPage({ setPlayerMeta }) {
  const [playlistData, setPlaylistData] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    // Async function for data fetching
    const fetchData = async () => {
      // Fetch playlist data from API
      try {
        const data = await getPlaylistInfo(id);
        setPlaylistData(data);
      } catch (error) {
        console.error("Error fetching playlist data:", error);
      }
    };

    fetchData();
    window.scrollTo(0, 0);

    //Cleanup on component unmount or dependency change
    return () => {
      setPlaylistData(null);
    };
  }, [id]);

  return (
    <>
      {playlistData ? (
        <div className="artist-page-bg" draggable="true">
          <PlaylistMainInfo
            PlaylistName={playlistData.name}
            description={playlistData.description}
            img={playlistData.images[0]?.url || defaultProfilePic}
          />
          <PlaylistTrackList
            data={playlistData.tracks.items}
            setPlayerMeta={setPlayerMeta}
          />
        </div>
      ) : (
        <>
          <ArtistMainInfoLoad />
          <div className="buttons-container">
            <Skeleton
              variant="rectangular"
              width={190}
              height={40}
              sx={{
                marginTop: "1.3rem",
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "2rem",
              }}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width={190}
              height={40}
              sx={{
                marginTop: "1.3rem",
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "2rem",
              }}
              animation="wave"
            />
          </div>
          <ArtistTopTrackPartLoad />
        </>
      )}
    </>
  );
}
