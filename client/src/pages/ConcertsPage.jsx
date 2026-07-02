import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDiscoveryConcerts } from "../services/contentService";
import "../assets/styles/ConcertsPage.css";

const REGIONS = [
  { value: "", label: "Global" },
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
];

const SkeletonCards = () =>
  Array.from({ length: 8 }).map((_, i) => (
    <div className="cp-skeleton-card" key={i}>
      <div className="cp-skeleton-img" />
      <div className="cp-skeleton-body">
        <div className="cp-skeleton-line short" />
        <div className="cp-skeleton-line full" />
        <div className="cp-skeleton-line medium" />
        <div className="cp-skeleton-line short" />
      </div>
    </div>
  ));

const ConcertsPage = () => {
  const [region, setRegion] = useState("");
  const [artistInput, setArtistInput] = useState("");
  const [debouncedArtist, setDebouncedArtist] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedArtist(artistInput), 600);
    return () => clearTimeout(timer);
  }, [artistInput]);

  const {
    data: concerts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["discoveryConcerts", region, debouncedArtist],
    queryFn: () => getDiscoveryConcerts(region, debouncedArtist),
    staleTime: 5 * 60 * 1000,
  });

  const formatDateBadge = (dateString) => {
    if (!dateString) return { day: "TBA", month: "" };
    const d = new Date(dateString);
    return { day: d.getDate(), month: d.toLocaleString("en-US", { month: "short" }) };
  };

  const formatVenue = (c) => [c.venue, c.city, c.country].filter(Boolean).join(", ");

  const regionLabel = REGIONS.find((r) => r.value === region)?.label || "Global";

  return (
    <div className="cp-page">
      {/* ══════════════ HERO BANNER ══════════════ */}
      <div className="cp-hero">
        <div className="cp-hero-inner">
          <div className="cp-hero-label">
            <i className="fa-solid fa-ticket" />
            Powered by Ticketmaster
          </div>
          <h1 className="cp-hero-title">Live Concerts</h1>
          <p className="cp-hero-desc">
            Browse upcoming music events worldwide. Find your next live experience.
          </p>
        </div>
      </div>

      {/* ══════════════ TOOLBAR (filters) ══════════════ */}
      <div className="cp-toolbar">
        <div className="cp-search-wrap">
          <span className="cp-search-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
            </svg>
          </span>
          <input
            id="cp-artist-search"
            type="text"
            className="cp-search-input"
            placeholder="Search artist name..."
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
          />
        </div>

        {/* Region select */}
        <div className="cp-region-wrap">
          <span className="cp-region-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </span>
          <select
            id="cp-region-select"
            className="cp-region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {!isLoading && concerts && (
          <span className="cp-results-count">
            <i
              className="fa-solid fa-circle-dot"
              style={{ fontSize: "0.45rem", color: "var(--accent-primary)" }}
            />
            {concerts.length} event{concerts.length !== 1 ? "s" : ""} · {regionLabel}
          </span>
        )}
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="cp-content">
        {isLoading ? (
          <div className="cp-loading">
            <SkeletonCards />
          </div>
        ) : isError ? (
          <div className="cp-state-box">
            <div className="cp-state-icon error">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h3 className="cp-state-title">Could not load concerts</h3>
            <p className="cp-state-desc">
              {error?.message || "An unexpected error occurred while fetching events."}
            </p>
            <button className="cp-retry-btn" onClick={() => refetch()}>
              <i className="fa-solid fa-rotate-right" /> Try Again
            </button>
          </div>
        ) : !concerts || concerts.length === 0 ? (
          <div className="cp-state-box">
            <div className="cp-state-icon empty">
              <i className="fa-solid fa-calendar-xmark" />
            </div>
            <h3 className="cp-state-title">No events found</h3>
            <p className="cp-state-desc">
              {debouncedArtist
                ? `No upcoming concerts for "${debouncedArtist}" in ${regionLabel}. Try a different artist or region.`
                : `No upcoming music events in ${regionLabel}. Try a different region.`}
            </p>
          </div>
        ) : (
          <div className="cp-grid">
            {concerts.map((concert) => {
              const { day, month } = formatDateBadge(concert.date);
              const hasImg = concert.images?.length > 0;
              const ticketUrl = concert.purchaseUrl || concert.url;

              return (
                <div className="cp-card" key={concert.id}>
                  {/* Image */}
                  <div className="cp-card-img-wrap">
                    {hasImg ? (
                      <img
                        src={concert.images[0].url}
                        alt={concert.name}
                        className="cp-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="cp-card-img-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <span>No image</span>
                      </div>
                    )}
                    <div className="cp-card-img-overlay" />
                    <div className="cp-card-date-badge">
                      <span className="cp-badge-day">{day}</span>
                      {month && <span className="cp-badge-month">{month}</span>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="cp-card-body">
                    <h3 className="cp-card-name">{concert.name}</h3>
                    <div className="cp-card-venue">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>{formatVenue(concert) || "Venue TBA"}</span>
                    </div>

                    <div className="cp-card-footer">
                      <span className="cp-card-price">
                        {concert.priceRanges?.length > 0
                          ? `${concert.priceRanges[0].currency} ${Math.round(concert.priceRanges[0].min)}–${Math.round(concert.priceRanges[0].max)}`
                          : "See site for prices"}
                      </span>
                      {ticketUrl && (
                        <a
                          href={ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cp-buy-btn"
                        >
                          <i className="fa-solid fa-ticket" style={{ fontSize: "0.7rem" }} />
                          Tickets
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcertsPage;
