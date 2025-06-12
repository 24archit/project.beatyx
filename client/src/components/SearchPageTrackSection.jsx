import React from "react";
import "../assets/styles/Section.css";
import { SectionName, SectionNameLoad } from "./SectionName.jsx";
import { SectionCard, SectionCardLoad } from "./SectionCard.jsx";
import { Link } from "react-router-dom";
import TrackLogo from "/Track-Logo.webp";
import Carousel from "./Carousel.jsx";

export default function SearchPageTrackSection(props) {
  return (
    <section className="section">
      <SectionName
        iconClass={props.iconClass}
        iconId={props.iconId}
        name={props.name}
        button={false}
      />
      <div className="material" draggable="true">
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
          {props.data.map((item) => (
            <SectionCard
              key={item.id}
              imgSrc={
                item.album && item.album.images && item.album.images.length > 0
                ? item.album.images[0].url
                : TrackLogo
            }
            iconClass="fa-solid fa-play"
            iconId="play-btn"
            cardName={item.name}
            cardStat={
              <React.Fragment>
                {item.artists &&
                  item.artists.length > 0 &&
                  item.artists.map((artist, idx) => (
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
            cardType="track"
            cardId={item.id}
            setPlayerMeta={props.setPlayerMeta}
            setTrackInfo={props.setTrackInfo}
            spotifyUrl={item.external_urls.spotify}
          />
        ))}
        </Carousel>
      </div>
    </section>
  );
}
