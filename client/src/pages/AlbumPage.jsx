import { PlaylistMainInfo } from "../components/PlaylistMainInfo";
import { useParams } from "react-router-dom";
import { getAlbumInfo } from "../apis/apiFunctions.js";
import { Skeleton } from "@mui/material";
import defaultProfilePic from "/profile-pic.webp";
import { ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart";
import { ArtistMainInfoLoad } from "../components/ArtistMainInfo";
import { Helmet } from "react-helmet-async";
import { AlbumTrackList } from "../components/AlbumTrackList.jsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
export default function AlbumPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: albumData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["album", id],
    queryFn: () => getAlbumInfo(id),
    staleTime: 15 * 60 * 1000, // Cache for 5 minutes
    retry: 3, // Retry up to 3 times automatically
  });
  const albumImage = albumData?.images?.[0]?.url || defaultProfilePic;
  const artistName = albumData?.artists?.[0]?.name || "Unknown Artist";
  return (
    <>
      <Helmet>
        {/* Dynamic Title */}
        <title>{albumData ? `${albumData.name} - Album by ${artistName} | Beatyx` : "Album | Beatyx"}</title>
        
        {/* Meta Description */}
        <meta 
          name="description" 
          content={albumData ? `Listen to the album ${albumData.name} by ${artistName} on Beatyx. Stream songs like ${albumData.tracks.items[0]?.name} and more.` : "Listen to top albums on Beatyx."} 
        />

        {/* Open Graph / Social Media Tags */}
        <meta property="og:type" content="music.album" />
        <meta property="og:title" content={albumData ? `${albumData.name} by ${artistName}` : "Album on Beatyx"} />
        <meta property="og:description" content={albumData ? `Stream ${albumData.name} on Beatyx` : ""} />
        <meta property="og:image" content={albumImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="Beatyx" />
      </Helmet>

      {isLoading ? (
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
      ) : albumData ? (
        <div className="artist-page-bg" draggable="true">
          <PlaylistMainInfo
            PlaylistName={albumData.name}
            description={albumData.album_type === "album" ? "Album" : "Single"}
            img={albumData.images[0]?.url || defaultProfilePic}
          />
          <AlbumTrackList
            data={albumData.tracks.items}
            trackImg={albumData.images[0]?.url || defaultProfilePic}
            setPlayerMeta={setPlayerMeta}
            setTrackInfo={setTrackInfo}
          />
        </div>
      ) : isError ? (
        <div style={{ color: "red", padding: "1rem" }}>
          Failed to load album: {error.message}
        </div>
      ) : null}
    </>
  );
}
