import React from "react";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import "../assets/styles/UpcomingConcerts.css"; // Assuming you have a CSS file for styles

const UpcomingConcerts = () => {
  const upcomingShows = [
    {
      id: 1,
      title: "Shreya Ghoshal Live in Concert",
      artist: "Shreya Ghoshal",
      venue: "Wembley Stadium, London, UK",
      city: "London",
      country: "UK",
      date: "2025-07-15",
      time: "8:00 PM",
      day: "Tue",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Bollywood Night with Shreya",
      artist: "Shreya Ghoshal",
      venue: "Madison Square Garden",
      city: "New York",
      country: "USA",
      date: "2025-08-22",
      time: "7:30 PM",
      day: "Fri",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: 3,
      title: "Classical Fusion Tour",
      artist: "Shreya Ghoshal",
      venue: "Royal Albert Hall",
      city: "London",
      country: "UK",
      date: "2025-09-10",
      time: "7:00 PM",
      day: "Wed",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop&crop=face"
    }
  ];

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
        <button className="view-all-btn">
          View all upcoming events ({upcomingShows.length})
        </button>
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

                <div className="concert-image">
                  <img src={show.image} alt={show.title} />
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
                  <button className="book-btn">
                    <ExternalLink size={14} />
                  </button>
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
