import React from "react";
import { useSharedPlayer } from "@/features/player";
import "../assets/styles/QueueList.css";
import TrackLogo from "/Track-Logo.webp";
import { Link } from "react-router-dom";

export function QueueList() {
  const {
    queue,
    currentTrackIndex,
    trackInfo,
    removeFromQueue,
    playQueue,
    playing,
    loadingTrackId,
  } = useSharedPlayer();

  if (!queue || queue.length === 0) {
    return (
      <div className="empty-queue-container">
        <i className="fa-solid fa-list-ul empty-icon"></i>
        <h2>Queue is empty</h2>
        <p>Add some tracks or play a playlist.</p>
      </div>
    );
  }

  const nextTracks = queue.slice(currentTrackIndex + 1);
  const previousTracks = queue.slice(0, currentTrackIndex);

  // Format artists helper
  const formatArtists = (artists) => {
    if (!artists || artists.length === 0) return "Unknown Artists";
    return artists.map((item) => item?.name || item).join(", ");
  };

  const handlePlayFromQueue = (indexInQueue) => {
    playQueue(queue, indexInQueue);
  };

  return (
    <div className="queue-list-container">
      {/* NOW PLAYING SECTION */}
      <h2 className="queue-section-title">Now Playing</h2>
      <div className="queue-item now-playing-item">
        <div className="queue-item-left">
          <div className="queue-item-img-container">
            <img src={trackInfo?.imgSrc || TrackLogo} alt="cover" />
            <div className="queue-wave">
              <div className="queue-wave-bars">
                <div className={`bar ${playing ? "is-playing" : ""}`}></div>
                <div className={`bar ${playing ? "is-playing" : ""}`}></div>
                <div className={`bar ${playing ? "is-playing" : ""}`}></div>
                <div className={`bar ${playing ? "is-playing" : ""}`}></div>
              </div>
            </div>
          </div>
          <div className="queue-item-info">
            <Link to={`/track/${trackInfo?.id || ""}`} className="queue-item-title active-title">
              {trackInfo?.trackName || "Unknown Track"}
            </Link>
            <div className="queue-item-artist">{formatArtists(trackInfo?.artistNames)}</div>
          </div>
        </div>
      </div>

      {/* NEXT IN QUEUE */}
      {nextTracks.length > 0 && (
        <>
          <h2 className="queue-section-title">Next In Queue</h2>
          <div className="queue-tracks-list">
            {nextTracks.map((track, relativeIndex) => {
              const actualIndex = currentTrackIndex + 1 + relativeIndex;
              return (
                <div className="queue-item" key={`${track.id}-${actualIndex}`}>
                  <div className="queue-item-left" onClick={() => handlePlayFromQueue(actualIndex)}>
                    <div className="queue-item-img-container">
                      <img
                        src={track.imgSrc || TrackLogo}
                        alt="cover"
                        style={{ opacity: loadingTrackId === track.id ? 0.5 : 1 }}
                      />
                      <div
                        className="play-overlay"
                        style={{ opacity: loadingTrackId === track.id ? 1 : "" }}
                      >
                        {loadingTrackId === track.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-play"></i>
                        )}
                      </div>
                    </div>
                    <div className="queue-item-info">
                      <div className="queue-item-title">{track.trackName}</div>
                      <div className="queue-item-artist">{formatArtists(track.artistNames)}</div>
                    </div>
                  </div>
                  <div className="queue-item-right">
                    <button
                      className="queue-action-btn remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(actualIndex);
                      }}
                      title="Remove from queue"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PREVIOUS TRACKS (To show loop capability) */}
      {previousTracks.length > 0 && (
        <>
          <h2 className="queue-section-title">Next up (Looping)</h2>
          <div className="queue-tracks-list">
            {previousTracks.map((track, actualIndex) => {
              return (
                <div className="queue-item" key={`${track.id}-${actualIndex}`}>
                  <div className="queue-item-left" onClick={() => handlePlayFromQueue(actualIndex)}>
                    <div className="queue-item-img-container">
                      <img
                        src={track.imgSrc || TrackLogo}
                        alt="cover"
                        style={{ opacity: loadingTrackId === track.id ? 0.5 : 1 }}
                      />
                      <div
                        className="play-overlay"
                        style={{ opacity: loadingTrackId === track.id ? 1 : "" }}
                      >
                        {loadingTrackId === track.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-play"></i>
                        )}
                      </div>
                    </div>
                    <div className="queue-item-info">
                      <div className="queue-item-title queue-dimmed">{track.trackName}</div>
                      <div className="queue-item-artist queue-dimmed">
                        {formatArtists(track.artistNames)}
                      </div>
                    </div>
                  </div>
                  <div className="queue-item-right">
                    <button
                      className="queue-action-btn remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(actualIndex);
                      }}
                      title="Remove from queue"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
