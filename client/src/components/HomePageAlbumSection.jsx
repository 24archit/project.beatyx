// client/src/components/HomePageAlbumSection.jsx
import "../assets/styles/Section.css";
import { SectionName } from "./SectionName.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { Link } from "react-router-dom";
import TrackLogo from "/Track-Logo.webp";
import Carousel from "./Carousel.jsx";
// SeeAllCard import removed

export default function HomePageAlbumSection(props) {
  return (
    <section className="section">
      <SectionName
        iconClass={props.iconClass}
        iconId={props.iconId}
        name={props.name}
        sectionName={props.sectionName}
        button={props.button}
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
          {props.data.map((item) => (
            <SectionCard
              key={item.id}
              imgSrc={
                item.images && item.images.length > 0
                  ? item.images[0].url
                  : TrackLogo
              }
              iconClass={"fa-solid fa-link"}
              iconId={"play-btn"}
              cardName={item.name}
              cardId={item.id}
              cardType="album"
              setPlayerMeta={props.setPlayerMeta}
              setTrackInfo={props.setTrackInfo}
              // Display Artists
              cardStat={
                <>
                  {item.artists.map((artist, idx) => (
                    <span key={artist.id}>
                      <Link
                        to={`/artist/${artist.id}`}
                        className={"card-stat-links"}
                      >
                        {artist.name}
                      </Link>
                      {idx < item.artists.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </>
              }
              artistNames={item.artists}
              spotifyUrl={item.external_urls.spotify}
              albumType={item.album_type}
            />
          ))}
          {/* SeeAllCard REMOVED here */}
        </Carousel>
      </div>
    </section>
  );
}