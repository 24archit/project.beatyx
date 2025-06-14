import React, { useEffect, useState } from "react";
import { Calendar, ExternalLink } from "lucide-react";
import "../assets/styles/UpcomingConcerts.css";

const UpcomingConcerts = ({ artistShows }) => {
  const validShows = (artistShows?.shows || [])
    .filter(
      (show) =>
        show?.id &&
        show?.city &&
        show?.date &&
        show?.venue &&
        show?.url &&
        artistShows?.artist
    )
    .map((show) => {
      const dateObj = new Date(show.date);
      const dayFormatted = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeFormatted = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: show.id,
        city: show.city,
        artist: artistShows.artist,
        date: show.date,
        day: dayFormatted,
        time: timeFormatted,
        venue: show.venue,
        image: show.images?.[0]?.url || "https://via.placeholder.com/150",
        url: show.url,
      };
    });

  const [upcomingShows, setUpcomingShows] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setUpcomingShows(validShows.slice(0, 3));
    setShowAll(false); // reset to default when artistShows changes
  }, [artistShows]);

  const handleToggle = () => {
    if (showAll) {
      setUpcomingShows(validShows.slice(0, 3));
    } else {
      setUpcomingShows(validShows);
    }
    setShowAll(!showAll);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  return (
    <section className="upcoming-concerts">
      <div className="section-header">
        <h2>Upcoming Events..</h2>
        {validShows.length > 3 && (
          <button className="view-all-btn" onClick={handleToggle}>
            {showAll
              ? "Show less"
              : `View all upcoming events (${validShows.length})`}
          </button>
        )}
      </div>

      <div className="concerts-list">
        {upcomingShows.length === 0 ? (
          <div className="no-events">
            <p>
              <Calendar size={20} style={{ marginRight: "8px" }} /> No upcoming
              events found.
            </p>
          </div>
        ) : (
          upcomingShows.map((show) => {
            const { month, day } = formatDate(show.date);
            return (
              <div key={show.id} className="concert-card">
                <div className="date-section">
                  <div className="month">{month}</div>
                  <div className="day">{day}</div>
                </div>

              

                <div className="concert-details">
                  <div className="concert-title">{show.city}</div>
                  <div className="concert-artist">{show.artist}</div>
                  <div className="concert-datetime">
                    <span className="concert-day">{show.day}</span>
                    <span className="concert-time">{show.time}</span>
                    <span className="concert-venue">{show.venue}</span>
                  </div>
                </div>

                <div className="concert-actions">
                  <a
                    className="book-btn"
                    href={show.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Book Now"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default UpcomingConcerts;
