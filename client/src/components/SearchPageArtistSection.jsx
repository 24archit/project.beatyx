import '../assets/styles/Section.css';
import { SectionName } from './SectionName.jsx';
import { SectionCard} from './SectionCard.jsx';
import ProfilePic from "/profile-pic.webp";
import Carousel from './Carousel.jsx';
export default function SearchPageArtistSection(props) {
    return (
        <section className="section">
            <SectionName iconClass={props.iconClass} iconId={props.iconId} name={props.name} button={false}  />
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
                            imgSrc={item.images && item.images.length > 0 ? item.images[0].url : ProfilePic}
                            cardName={item.name}
                        cardStat={
                            <span className="card-stat-2">{`Trend-Score: ${item.popularity}/100`}</span>
                        }
                        followers={item.followers ? item.followers.total : 0}  
                        cardType ="artist"
                        cardId={item.id}
                        spotifyUrl={item.external_urls.spotify}
                    />
                ))}
                </Carousel>
            </div>
        </section>
    );
}
