import "../assets/styles/PlaylistTrackList.css"
import {TrackLineCard, TrackLineCardLoad} from "./TrackLineCard";
import { Link } from 'react-router-dom';
import TrackLogo from "../assets/media/Track-Logo.webp";
import React, { useEffect } from 'react';  
export  function PlaylistTrackList(props) {
    return (
        <div className="playlist-track-container">
            {props.data.map((item, index)=>(
                <TrackLineCard
                key={index}
                imgSrc={item.track.album.images.length>0?item.track.album.images[0].url:TrackLogo}
                trackName={item.track.name}
                trackRank={index+1}
                duration={item.track.duration_ms}
                trackArtists={<React.Fragment>
                    {item.track.artists.map((artist, idx) => (
                        <span key={artist.id}>
                            <Link to={`/artist/${artist.id}`} className="card-stat-links">{artist.name}</Link>
                            {idx < item.track.artists.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </React.Fragment>}
                spotifyUrl={item.track.external_urls.spotify}
                cardId ={item.track.id}
                setPlayerMeta={props.setPlayerMeta}
                />
                
            ))}
        </div>
    );
}