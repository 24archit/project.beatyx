import '../assets/styles/ArtistProfilePic.css';
import { Skeleton } from '@mui/material';
import defaultProfilePic from '../assets/media/profile-pic.webp';

export function ArtistProfilePic({ imgSrc = defaultProfilePic }) {
    return (
        <img src={imgSrc} alt="artist-profile-pic" id='artist-pic' loading="lazy" />
    );
}

export function ArtistProfilePicLoad() {
    return (
        <Skeleton
            variant="rectangular"
            width={200}
            height={200}
            sx={{
                marginLeft: '1rem',
                marginRight: '1rem',
                marginTop: '1.3rem',
                bgcolor: 'rgba(71, 164, 211, 0.261)',
                borderRadius: '1rem'
            }}
            animation="wave"
        />
    );
}
