// client/src/components/TrackMainInfo.jsx
import "../assets/styles/ArtistMainInfo.css";
import "../assets/styles/PlaylistMainInfo.css";
import { PlaylistProfilePic } from "./PlaylistProfilePic.jsx";
import { Skeleton } from "@mui/material";

export function TrackMainInfo({
    trackName,
    artists,
    albumName,
    releaseDate,
    img,
}) {
    const year = releaseDate ? releaseDate.split('-')[0] : '';
    const artistNames = artists ? artists.map(a => a.name).join(', ') : '';
    
    return (
        <div className="mainInfo-1">
             <PlaylistProfilePic imgSrc={img} />
            <div className="name-stat-1">
                <p style={{fontSize: "1rem", fontWeight: "bold", color: "#ddd"}}>Single</p>
                <p id="playlist-name" style={{fontSize: "3rem"}}>{trackName}</p>
                <p id="playlist-description">{artistNames} • {albumName} • {year}</p>
            </div>
        </div>
    );
}

export function TrackMainInfoLoad() {
    return (
        <div className="mainInfo-1">
             <Skeleton 
                variant="rectangular" 
                width={220} 
                height={220} 
                sx={{ bgcolor: 'rgba(71, 164, 211, 0.261)', borderRadius: '1rem' }} 
             />
            <div className="name-stat-1" style={{ width: '100%', gap: "1rem" }}>
                <Skeleton sx={{ bgcolor: 'rgba(71, 164, 211, 0.261)', width: '10%', height: 20 }} />
                <Skeleton sx={{ bgcolor: 'rgba(71, 164, 211, 0.261)', fontSize: '4rem', width: '60%', height: 80 }} />
                <Skeleton sx={{ bgcolor: 'rgba(71, 164, 211, 0.261)', width: '40%', height: 20 }} />
            </div>
        </div>
    );
}