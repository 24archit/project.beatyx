import React from 'react';
import '../assets/styles/Section.css';
import { SectionName } from './SectionName.jsx';
import { SectionCard } from './SectionCard.jsx';
import { Link } from 'react-router-dom';
import PlaylistIcon from "/playlist-icon.webp"
import Carousel from './Carousel.jsx';

export default function SearchPageAlbumSection(props) {
    return (
        <section className="section">
            <SectionName iconClass={props.iconClass} iconId={props.iconId} name={props.name} button={false}/>
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
                        imgSrc={item.images && item.images.length > 0 ? item.images[0].url : PlaylistIcon}
                        iconClass="fa-solid fa-link"
                        iconId="link-icon"
                        cardName={item.name}
                        cardStat={
                            <React.Fragment>
                                {item.artists && item.artists.length > 0 && item.artists.map((artist, idx) => (
                                    <span key={artist.id}>
                                        <Link to={`/artist/${artist.id}`} className="card-stat-links">{artist.name}</Link>
                                        {idx < item.artists.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </React.Fragment>
                        }
                        albumType={item.album_type}
                        cardType='album'
                        cardId={item.id}
                        spotifyUrl={item.external_urls.spotify}
                    />
                ))}
                </Carousel>
            </div>
        </section>
    );
}
