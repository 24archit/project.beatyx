import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  ArtistMainInfo,
  ArtistMainInfoLoad,
} from "../components/ArtistMainInfo.jsx";
import {
  ArtistTopTrackPart,
  ArtistTopTrackPartLoad,
} from "../components/ArtistTopTrackPart.jsx";
import { SectionCard, SectionCardLoad } from "../components/SectionCard.jsx";
import Carousel from "../components/Carousel.jsx";
import UpcomingConcerts from "../components/UpcomingConcerts.jsx";
import defaultProfilePic from "/profile-pic.webp";
import { Skeleton } from "@mui/material";
import { getArtistInfo } from "../apis/apiFunctions.js";
import "../assets/styles/ArtistPage.css";

export default function ArtistPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const [selectedBtn, setSelectedBtn] = useState("topTracks");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => getArtistInfo(id),
    staleTime: 15 * 60 * 1000,
    retry: 3,
  });

  const artistData = data?.ArtistData;
  const artistTopTracks = data?.ArtistTopTracks;
  const artistAlbums = data?.ArtistTopAlbums;
  const artistShows = data?.ArtistShows;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  return (
    <>
      {artistData && (
        <Helmet>
          <title>{`${artistData.name} | Beatyx`}</title>
        </Helmet>
      )}

      <div className="artist-page-bg" draggable="true">
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
          </>
        ) : artistData ? (
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
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 168 168"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Spotify Logo"
                  >
                    <title>Explore Artist On Spotify</title>
                    <path
                      fill="#ffffff"
                      d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.2 121.2c-1.4 2.3-4.4 3-6.7 1.6-18.4-11.3-41.5-13.9-68.8-7.8-2.6.6-5.2-1-5.8-3.6-.6-2.6 1-5.2 3.6-5.8 30.5-6.8 57.3-3.7 78 9 2.2 1.4 2.9 4.4 1.7 6.6zm9.5-19.5c-1.8 2.9-5.5 3.8-8.3 2-21.1-13-53.3-16.8-78.1-9.5-3.2.9-6.5-.9-7.5-4.1-.9-3.2.9-6.5 4.1-7.5 29.7-8.5 66.4-4.2 91.6 11.1 2.8 1.8 3.6 5.5 2 8zm.9-20.6c-25.2-15.2-66.5-16.6-90.5-9.4-3.8 1.1-7.8-1-8.9-4.8-1.1-3.8 1-7.8 4.8-8.9 28.6-8.5 75.5-6.8 104.2 10.8 3.4 2 4.5 6.4 2.4 9.8-2.1 3.4-6.5 4.5-9.9 2.5z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <hr className="custom-hr" />
          </>
        ) : isError ? (
          <p style={{ color: "red" }}>Error: {error.message}</p>
        ) : null}

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
                      <>
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
                      </>
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

      <UpcomingConcerts artistShows={artistShows} />
    </>
  );
}
