  import React, { useState, useEffect, useRef } from "react";
  import "../assets/styles/Section.css";
  import { SectionName } from "./SectionName.jsx";
  import { SectionCard } from "./SectionCard.jsx";
  import { Link } from "react-router-dom";
  import TrackLogo from "../assets/media/Track-Logo.webp";

  export default function HomePagePlaylistTrackSection(props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(5);
    const totalSlides = props.data.length;
    const containerRef = useRef(null); // Reference to the container for calculating the width

    // Responsive slidesToShow calculation based on parent container's width
    useEffect(() => {
      const updateSlidesToShow = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;

          if (containerWidth <= 800) {
            setSlidesToShow(1.5);  // Show 1.5 cards on smaller screens
          } else if (containerWidth <= 1024) {
            setSlidesToShow(3);    // Show 3 cards on medium screens
          } else {
            setSlidesToShow(5);    // Show 5 cards on larger screens
          }
        }
      };

      updateSlidesToShow();
      window.addEventListener("resize", updateSlidesToShow);
      return () => {
        window.removeEventListener("resize", updateSlidesToShow);
      };
    }, [props.data]);

    // Calculate whether the next button should be disabled
    const isAtEnd = currentIndex + slidesToShow >= totalSlides;

    // Navigation handlers
    const handleNext = () => {
      // Only move forward if not at the end
      if (!isAtEnd) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    };

    const handlePrev = () => {
      // Prevent going back beyond the first index
      if (currentIndex > 0) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
      }
    };

    return (
      <section className="section" ref={containerRef}>
        <SectionName
          iconClass={props.iconClass}
          iconId={props.iconId}
          name={props.name}
          sectionName={props.sectionName}
        />
        <div className="slider-container">
          <button
            className="slider-btn prev-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            &#10094;
          </button>
          <div
            className="track-cards"
            style={{
              transform: `translateX(-${(currentIndex * 100) / slidesToShow}%)`,
              gridTemplateColumns: `repeat(${totalSlides}, 1fr)`,
            }}
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
          <button
            className="slider-btn next-btn"
            onClick={handleNext}
            disabled={isAtEnd}
            style={{
              opacity: isAtEnd ? "0" : "1", // Hide next button when at the end
              pointerEvents: isAtEnd ? "none" : "auto", // Disable the button when at the end
              transition: "opacity 0.3s ease", // Smooth transition
            }}
          >
            &#10095;
          </button>
        </div>
      </section>
    );
  }
