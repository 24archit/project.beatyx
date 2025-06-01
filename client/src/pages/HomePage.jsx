import React, { useEffect, useState } from "react";
import HomePagePlaylistTrackSection from "../components/HomePagePlaylistTrackSection.jsx";
import SectionLoading from "../components/SectionLoading.jsx";
import {
  getTopTracksIndia,
  getTopTracksGlobal,
} from "../apis/apiFunctions.js";
import { Helmet } from "react-helmet-async";
export default function HomePage({ setPlayerMeta, setTrackInfo }) {
  const [topIndiaTracks, setTopIndiaTracks] = useState([]);
  const [topGlobalTracks, setTopGlobalTracks] = useState([]);
  const [userTopArtists, setUserTopArtists] = useState([]);

  const fetchTracks = async (fetchFunction, setTracks) => {
    let retryCount = 0; // Track the number of retries
    const maxRetries = 3; // Set a limit for retries

    while (retryCount < maxRetries) {
      try {
        const data = await fetchFunction();
        const newArr = data.tracks.items;
        setTracks(newArr);
        return; // Exit the function if successful
      } catch (error) {
        console.error(
          `Attempt ${retryCount + 1} - Error fetching tracks:`,
          error
        );

        retryCount += 1;

        // If retries are exhausted, reload the page
        if (retryCount === maxRetries) {
          console.log("Reloading the page to resolve the error...");
          window.location.reload();
          return;
        }

        // Optionally add a short delay between retries
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTracks(getTopTracksIndia, setTopIndiaTracks);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchTracks(getTopTracksGlobal, setTopGlobalTracks);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  // useEffect(() => {
  //   const fetchUserTopArtists = async () => {
  //     try {
  //       const data = await getUserTopArtists(12);
  //       setUserTopArtists(data.items);
  //     } catch (error) {
  //       console.error('Error fetching user top artists:', error);
  //     }
  //   };
  //   fetchUserTopArtists();
  // }, []);

  const handleMoreClick = (setTracks, tracks, visibleCount) => {
    setTracks(tracks.slice(0, visibleCount + 45));
  };

  return (
    <>
      <Helmet>
        <title>Beatyx - Play Music </title>
      </Helmet>
      {topIndiaTracks.length ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Tracks: Live from India"
          data={topIndiaTracks.slice(0, 45)}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          showMore={topIndiaTracks.length > 45}
          onMoreClick={() =>
            handleMoreClick(setTopIndiaTracks, topIndiaTracks, 45)
          }
          sectionName="top-tracks-india"
        />
      ) : (
        <SectionLoading
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Tracks: Live from India"
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}

      {topGlobalTracks.length ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Sync: Global Top Tracks"
          data={topGlobalTracks.slice(0, 45)}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          showMore={topGlobalTracks.length > 45}
          onMoreClick={() =>
            handleMoreClick(setTopGlobalTracks, topGlobalTracks, 45)
          }
          sectionName="top-tracks-global"
        />
      ) : (
        <SectionLoading
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Sync: Global Top Tracks"
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}
    </>
  );
}
