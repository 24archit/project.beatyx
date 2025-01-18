import React, { useEffect, useState } from "react";
import HomePagePlaylistTrackSection from "../components/HomePagePlaylistTrackSection.jsx";
import SectionLoading from "../components/SectionLoading.jsx";
import {
  getTopTracksIndia,
  getTopTracksGlobal,
  getUserTopArtists,
} from "../apis/apiFunctions.js";

export default function HomePage({ setPlayerMeta }) {
  const [topIndiaTracks, setTopIndiaTracks] = useState([]);
  const [topGlobalTracks, setTopGlobalTracks] = useState([]);
  const [userTopArtists, setUserTopArtists] = useState([]);

  const fetchTracks = async (fetchFunction, setTracks) => {
    try {
      const data = await fetchFunction();
      const newArr = data.tracks.items;
      setTracks(newArr);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {await fetchTracks(getTopTracksIndia, setTopIndiaTracks);};
    fetchData();
    
  }, []);

  useEffect(() => {
    const fetchData = async () => {fetchTracks(getTopTracksGlobal, setTopGlobalTracks);};
    fetchData();
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
      {topIndiaTracks.length ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Tracks: Live from India"
          data={topIndiaTracks.slice(0, 45)}
          setPlayerMeta={setPlayerMeta}
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
        />
      )}

      {topGlobalTracks.length ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Sync: Global Top Tracks"
          data={topGlobalTracks.slice(0, 45)}
          setPlayerMeta={setPlayerMeta}
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
        />
      )}
    </>
  );
}
