import { useEffect, useState } from "react";
import {
  ArtistMainInfo,
  ArtistMainInfoLoad,
} from "../components/ArtistMainInfo.jsx";
import "../assets/styles/ArtistPage.css";
import {
  ArtistTopTrackPart,
  ArtistTopTrackPartLoad,
} from "../components/ArtistTopTrackPart.jsx";
import { getArtistInfo } from "../apis/apiFunctions.js";
import { useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";
import defaultProfilePic from "../assets/media/profile-pic.webp";
import { SectionCard, SectionCardLoad } from "../components/SectionCard.jsx";
import React from "react";
import { Link } from "react-router-dom";
import spotifyLogo from "../assets/media/Spotify_logo.webp";

export default function ArtistPage({ setPlayerMeta, isAuth }) {
  const { id } = useParams();
  const [artistData, setArtistData] = useState(null);
  const [selectedBtn, setSelectedBtn] = useState("topTracks");
  const [artistTopTracks, setArtistTopTracks] = useState(null);
  const [artistAlbums, setArtistAlbums] = useState(null);

 

  // Fetch artist data from API
  const fetchArtistData = async () => {
    try {
      const data = await getArtistInfo(id);
      setArtistData(data.ArtistData);
      setArtistTopTracks(data.ArtistTopTracks);
      setArtistAlbums(data.ArtistTopAlbums);
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  };

  useEffect(() => {
    // Async function for data fetching
    const fetchData = async () => {
      await fetchArtistData();
    };

    fetchData();
    window.scrollTo(0, 0);
    // Cleanup on component unmount or dependency change
    return () => {
      setArtistData(null);
      setArtistTopTracks(null);
      setArtistAlbums(null);
    };
  }, [id]);
  return (
    <div className="artist-page-bg" draggable="true">
      {artistData ? (
        <>
          <ArtistMainInfo
            artistName={artistData.name}
            followers={artistData.followers.total}
            trendScore={artistData.popularity}
            img={
              artistData.images.length > 0
                ? artistData.images[0].url
                : defaultProfilePic
            }
          />
          <div className="buttons-container">
            <button
              className={selectedBtn === "topTracks" ? "btn selected" : "btn"}
              onClick={() => setSelectedBtn("topTracks")}
            >
              Top Tracks
            </button>
            <button
              className={selectedBtn === "albums" ? "btn selected" : "btn"}
              onClick={() => setSelectedBtn("albums")}
              style={{ marginLeft: "2rem", marginRight: "2rem" }}
            >
              Albums
            </button>
            <div className="spotify-logo">
              <a
                href={artistData.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explore the content on Spotify"
                title="Explore the content on Spotify"
              >
                <img src={spotifyLogo} alt="Spotify Logo" />
              </a>
            </div>
          </div>
          <hr className="custom-hr" />
        </>
      ) : (
        <>
          <ArtistMainInfoLoad/>
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
        </>
      )}
      {selectedBtn === "topTracks" ? (
        artistTopTracks ? (
          <ArtistTopTrackPart data={artistTopTracks} setPlayerMeta={setPlayerMeta} />
        ) : (
          <ArtistTopTrackPartLoad />
        )
      ) : (
        <div className="material">
          {artistAlbums ? (
            artistAlbums.items.map((item, index) => (
              <SectionCard
                key={index}
                imgSrc={item.images[0]?.url || defaultProfilePic}
                cardName={item.name}
                cardStat={
                  <React.Fragment>
                    {item.artists.map((artist, idx) => (
                      <span key={artist.id}>
                        <Link
                          to={`/artist/${artist.id}`}
                          className="card-stat-links"
                        >
                          {artist.name}
                        </Link>
                        {idx < item.artists.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </React.Fragment>
                }
                albumType={item.album_type}
                cardId={item.id}
                setPlayerMeta={setPlayerMeta}
                cardType="album"
              />
            ))
          ) : (
            <>
              <SectionCardLoad />
              <SectionCardLoad />
              <SectionCardLoad />
              <SectionCardLoad />
              <SectionCardLoad />
              <SectionCardLoad />
            </>
          )}
        </div>
      )}
    </div>
  );
}
