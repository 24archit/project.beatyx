// client/src/components/HomePagePlaylistSection.jsx
import React from "react";
import "../assets/styles/Section.css";
import { SectionName } from "./SectionName.jsx";
import { SectionCard } from "./SectionCard.jsx";
import TrackLogo from "/Track-Logo.webp";
import Carousel from "./Carousel.jsx";

export default function HomePagePlaylistSection(props) {
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
          responsive={{ mobile: 2, tablet: 3, medium: 4, large: 5, desktop: 6 }}
          gap="1rem"
          className="track-carousel"
        >
          {props.data.map((item) => (
            <SectionCard
              key={item.id}
              imgSrc={item.images?.[0]?.url || TrackLogo}
              iconClass={"fa-solid fa-link"}
              iconId={"play-btn"}
              cardName={item.name}
              cardId={item.id}
              cardType="playlist"
              setPlayerMeta={props.setPlayerMeta}
              setTrackInfo={props.setTrackInfo}
              cardStat={
                <span 
                  className="card-stat-text" 
                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem', color: '#b3b3b3', textDecoration: 'none' }}
                  dangerouslySetInnerHTML={{ __html: item.description || `By ${item.owner.display_name}` }} 
                />
              }
              spotifyUrl={item.external_urls.spotify}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}