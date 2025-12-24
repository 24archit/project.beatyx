import "../assets/styles/ArtistTopTrackPart.css"
import {TrackLineCard, TrackLineCardLoad} from "./TrackLineCard";
import { Link } from 'react-router-dom';
import TrackLogo from "/Track-Logo.webp";
import React from 'react';
export  function ArtistTopTrackPart(props) {
    return (
        <div className="artist-top-track-container">
            {props.data.tracks.map((item, index)=>(
                <TrackLineCard
                key={index}
                imgSrc={item.album.images.length >0 ? item.album.images[0].url : TrackLogo}
                trackName={item.name}
                trackRank={index+1}
                duration={item.duration_ms}
                trackArtists={<React.Fragment>
                    {item.artists.map((artist, idx) => (
                        <span key={artist.id}>
                            <Link to={`/artist/${artist.id}`} className="card-stat-links">{artist.name}</Link>
                            {idx < item.artists.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </React.Fragment>}
                spotifyUrl={item.external_urls.spotify}
                cardId ={item.id}
                setPlayerMeta={props.setPlayerMeta}
                setTrackInfo={props.setTrackInfo}
                artistNames={item.artists}
                />
                
            ))}
        </div>
    );
}
export function ArtistTopTrackPartLoad() {
    return (
        <div className="artist-top-track-container">
            <TrackLineCardLoad />
            <TrackLineCardLoad />
            <TrackLineCardLoad />
            <TrackLineCardLoad />
        </div>
    );
}