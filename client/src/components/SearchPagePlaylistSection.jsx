import React from 'react';
import '../assets/styles/Section.css';
import { SectionName, SectionNameLoad } from './SectionName.jsx';
import { SectionCard, SectionCardLoad } from './SectionCard.jsx';
import { Link } from 'react-router-dom';
import PlaylistIcon from "/playlist-icon.webp";
import Carousel from './Carousel.jsx';

export default function SearchPagePlaylistSection({
    iconClass,
    iconId,
    name,
    data = []
}) {
    return (
        <section className="section">
            <SectionName iconClass={iconClass} iconId={iconId} name={name} button={false}  />
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
                    {data.map((item) => (
                        <SectionCard
                            key={item.id}
                            imgSrc={item.images && item.images.length > 0 ? item.images[0].url : PlaylistIcon}
                            iconClass="fa-solid fa-link"
                        iconId="link-icon"
                        cardName={item.name}
                        cardStat={
                            !item.collaborative ? (
                                <span>
                                    {item.owner && (
                                        <Link to={`/spotifyuser/profile/${item.owner.id}`} className="card-stat-links">
                                            {item.owner.display_name}
                                        </Link>
                                    )}
                                </span>
                            ) : (
                                <span>
                                    <p className="card-stat-2">Playlist</p>
                                </span>
                            )
                        }
                        cardType='playlist'
                        cardId={item.id}
                        spotifyUrl={item.external_urls.spotify}
                    />
                ))}
                </Carousel>
            </div>
        </section>
    );
}
