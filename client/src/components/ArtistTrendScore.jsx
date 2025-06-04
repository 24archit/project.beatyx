import { Skeleton } from "@mui/material";
import "../assets/styles/ArtistTrendScore.css" 
import { format } from "indian-number-format";
export function ArtistTrendScore(props) {
    return (
        <>
            <h4 id="artist-trend-score">{`Trend-Score: ${props.trendScore}/100`}</h4>
        </>
    );
}
export  function ArtistTrendScoreLoad() {
    return (
        <>
            <h1 style={{display:"flex"}}><Skeleton width='15rem' sx={{bgcolor: 'rgba(71, 164, 211, 0.261)', marginRight:'4rem'}} animation='wave' /> <Skeleton width='15rem' sx={{bgcolor: 'rgba(71, 164, 211, 0.261)'}} /></h1>

        </>
    );
}