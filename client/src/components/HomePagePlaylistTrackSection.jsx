import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/Section.css";
import { SectionName } from "./SectionName.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { Link } from "react-router-dom";
import TrackLogo from "../assets/media/Track-Logo.webp";
  
export default function HomePagePlaylistTrackSection(props) {
  return (
    <section className="section">
      <SectionName
        iconClass={props.iconClass}
        iconId={props.iconId}
        name={props.name}
        sectionName={props.sectionName}
      />
      <div className="material" draggable="true">
        {props.data.map((item, index) => (
          <SectionCard
            key={item.track.id}
            imgSrc={
              item.track.album.images.length > 0
                ? item.track.album.images[0].url
                : TrackLogo
            }
            iconClass={"fa-solid fa-play"}
            iconId={"play-btn"}
            cardName={item.track.name}
            cardId={item.track.id}
            cardType="track"
            setPlayerMeta={props.setPlayerMeta}
            setTrackInfo={props.setTrackInfo}
            cardStat={
              <>
                {item.track.artists.map((artist, idx) => (
                  <span key={artist.id}>
                    <Link
                      to={`/artist/${artist.id}`}
                      className={"card-stat-links"}
                    >
                      {artist.name}
                    </Link>
                    {idx < item.track.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </>
            }
            spotifyUrl={item.track.external_urls.spotify}
          />
        ))}
      </div>
    </section>
  );
}
