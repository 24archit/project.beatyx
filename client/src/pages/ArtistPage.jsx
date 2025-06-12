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
import defaultProfilePic from "/profile-pic.webp";
import { SectionCard, SectionCardLoad } from "../components/SectionCard.jsx";
import React from "react";
import { Link } from "react-router-dom";
import spotifyLogo from "/Spotify_logo.webp";
import { Helmet } from "react-helmet-async";
import UpcomingConcerts from "../components/UpcomingConcerts.jsx";
import Carousel from "../components/Carousel.jsx";

export default function ArtistPage({ setPlayerMeta, isAuth, setTrackInfo }) {
  const { id } = useParams();
  const [artistData, setArtistData] = useState(null);
  const [selectedBtn, setSelectedBtn] = useState("topTracks");
  const [artistTopTracks, setArtistTopTracks] = useState(null);
  const [artistAlbums, setArtistAlbums] = useState(null);

  const fetchArtistData = async () => {
    let retryCount = 0; // Track the number of retries
    const maxRetries = 3; // Set a limit for retries

    while (retryCount < maxRetries) {
      try {
        const data = await getArtistInfo(id);
        setArtistData(data.ArtistData);
        setArtistTopTracks(data.ArtistTopTracks);
        setArtistAlbums(data.ArtistTopAlbums);
        return; // Exit the function if successful
      } catch (error) {
        console.error(
          `Attempt ${retryCount + 1} - Error fetching artist data:`,
          error
        );

        // If max retries are reached, reload the page
        if (retryCount + 1 === maxRetries) {
          console.log("Reloading the page to resolve the error...");
          window.location.reload();
          return;
        }

        retryCount += 1;
        // Optionally, add a short delay between retries
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
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
    <>
    {artistData ?( <Helmet>
        <title>{`${artistData.name} | Beatyx`}</title>
      </Helmet>):null}
     
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
                  <img src={spotifyLogo} alt="Spotify Logo" loading="lazy" />
                </a>
              </div>
            </div>
            <hr className="custom-hr" />
          </>
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
          </>
        )}
        {selectedBtn === "topTracks" ? (
          artistTopTracks ? (
            <ArtistTopTrackPart
              data={artistTopTracks}
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
            />
          ) : (
            <ArtistTopTrackPartLoad />
          )
        ) : (
          <div className="material">
            <Carousel
              showArrows={true}
              showDots={true}
              autoScroll={false}
              responsive={{
                mobile: 2,
                tablet: 3,
                medium: 4,
                large: 5,
                desktop: 6,
              }}
              gap="1rem"
              className="track-carousel"
            >
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
                    setTrackInfo={setTrackInfo}
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
            </Carousel>
          </div>
        )}
      </div>
      <UpcomingConcerts />
    </>
  );
}
