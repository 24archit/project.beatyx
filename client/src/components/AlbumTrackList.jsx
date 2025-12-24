import "../assets/styles/PlaylistTrackList.css"
import {TrackLineCard} from "./TrackLineCard";
import { Link } from 'react-router-dom';
import React from 'react'; 
export  function AlbumTrackList(props) {
    return (
        <div className="playlist-track-container">
            {props.data.map((item, index)=>(
                <TrackLineCard
                key={index}
                imgSrc={props.trackImg}
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