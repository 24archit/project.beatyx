import "../assets/styles/PlaylistTrackList.css"
import {TrackLineCard} from "./TrackLineCard";
import { Link } from 'react-router-dom';
import TrackLogo from "/Track-Logo.webp";
import React from "react";
export  function PlaylistTrackList(props) {
    return (
        <div className="playlist-track-container">
            {props.data.map((item, index)=>(
               <React.Fragment key={index}>
                   {item.track && item.track.album && item.track.album.images.length > 0 && item.track.name && item.track.id && (item.track.artists && item.track.artists.length > 0) && item.track.external_urls && item.track.external_urls.spotify &&(
                   <TrackLineCard
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
                       setTrackInfo={props.setTrackInfo}
                       isPlaylist={props.isPlaylist}
                       artistNames={item.track.artists}
                   />
                   )}
               </React.Fragment>
            ))}
        </div>
    );
}