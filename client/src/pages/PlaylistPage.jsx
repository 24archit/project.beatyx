import { PlaylistMainInfo } from "../components/PlaylistMainInfo";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistInfo } from "../apis/apiFunctions.js";
import { Skeleton } from "@mui/material";
import defaultProfilePic from "/profile-pic.webp";
import { ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart";
import { ArtistMainInfoLoad } from "../components/ArtistMainInfo";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import React from "react";
import { Helmet } from "react-helmet-async";
export default function PlaylistPage({ setPlayerMeta, setTrackInfo }) {
  const [playlistData, setPlaylistData] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    // Async function for data fetching
    const fetchData = async () => {
      let retryCount = 0; // Track the number of retries
      const maxRetries = 3; // Set a limit for retries

      while (retryCount < maxRetries) {
        try {
          // Fetch playlist data from API
          const data = await getPlaylistInfo(id);
          setPlaylistData(data.playlist);
          return; // Exit the loop if successful
        } catch (error) {
          console.error(
            `Attempt ${retryCount + 1} - Error fetching playlist data:`,
            error
          );
          retryCount += 1;

          if (retryCount === maxRetries) {
            console.log("Max retries reached. Reloading the page...");
            window.location.reload(); // Reload the page after exhausting retries
            return;
          } else {
            // Add a small delay before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    };

    fetchData();
    window.scrollTo(0, 0);

    // Cleanup on component unmount or dependency change
    return () => {
      setPlaylistData(null);
    };
  }, [id]);

  return (
    <>
      <Helmet>
        <title>Playlist | Beatyx</title>
      </Helmet>
      {playlistData ? (
        <div className="artist-page-bg" draggable="true">
          <PlaylistMainInfo
            PlaylistName={playlistData.name}
            description={playlistData.description}
            img={playlistData.images[0]?.url || defaultProfilePic}
          />
          <PlaylistTrackList
            data={playlistData.tracks.items}
            isPlaylist={true}
            setPlayerMeta={setPlayerMeta}
            setTrackInfo={setTrackInfo}
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
