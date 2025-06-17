import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPlaylistInfo } from "../apis/apiFunctions";
import { PlaylistMainInfo } from "../components/PlaylistMainInfo";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import { ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart";
import { ArtistMainInfoLoad } from "../components/ArtistMainInfo";
import defaultProfilePic from "/profile-pic.webp";
import { Skeleton } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

export default function PlaylistPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: playlistData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getPlaylistInfo(id).then((res) => res.playlist),
    retry: 2, // Retries 2 more times after first failure
    staleTime: 15 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window is focused
  });

  // Retry fallback (manual reload)
  if (isError) {
    return (
      <div className="artist-page-bg" draggable="true">
        <h2 style={{ color: "white", textAlign: "center" }}>
          Failed to load playlist.{" "}
          <button onClick={refetch} style={{ textDecoration: "underline" }}>
            Retry
          </button>
        </h2>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Playlist | Beatyx</title>
      </Helmet>
      {isLoading || !playlistData ? (
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
      ) : (
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
      )}
    </>
  );
}
