import "../assets/styles/FollowBtn.css" 
import { Skeleton } from "@mui/material";
export function FollowBtn(props) {
    return (
        <>
        <div className="follow-btn-container">
            <button id="followbtn"><span>Follow</span></button>
        </div>
        </>
    );
}
export function FollowBtnLoad(props) {
    return (
        <>
            <Skeleton variant="rectangular" width={190} height={40} sx={{ marginTop: '1.3rem', bgcolor:'rgba(71, 164, 211, 0.261)', borderRadius: '2rem'}} animation='wave' />
        </>
    );
}