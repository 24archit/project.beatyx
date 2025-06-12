import React from "react";
import "../assets/styles/Section.css";
import { SectionName } from "./SectionName.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { Link } from "react-router-dom";
import TrackLogo from "/Track-Logo.webp";
import Carousel from "./Carousel.jsx";
import SeeAllCard from "./SeeAllCard.jsx";

export default function HomePagePlaylistTrackSection(props) {
  return (
    <section className="section">
      <SectionName
        iconClass={props.iconClass}
        iconId={props.iconId}
        name={props.name}
        sectionName={props.sectionName}
      />
      
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
            desktop: 6
          }}
          gap="1rem"
          className="track-carousel"
        >
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
          <SeeAllCard routeTo={props.routeTo} />
        </Carousel>
      </div>
    </section>
  );
}