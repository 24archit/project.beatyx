import React, { useState } from 'react';
import { Share2, Edit3, Play, Heart, Clock, Music, Users, List, Plus, ExternalLink, Headphones, Calendar, Star } from 'lucide-react';
import '../assets/styles/ProfilePage.css'; // Assuming you have a CSS file for styles
import { Skeleton } from '@mui/material';
export const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Sample data
  const userProfile = {
    name: "Archit Mishra",
    username: "@24archit",
    bio: "Music enthusiast • Playlist curator • Always discovering new sounds",
    profilePic: "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84119ffcf4ca6ea8951c75472c",
    followedArtists: 142,
    likedSongs: 1247,
    playlistCount: 23,
    followingCount: 89,
    followerCount: 156,
    joinedDate: "March 2022",
    topGenres: ["Pop", "Alternative", "Indie", "Electronic"]
  };

  const featuredPlaylists = [
    {
      id: 1,
      name: "Midnight Vibes",
      trackCount: 67,
      isPublic: true,
      plays: "12.5K",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      mood: "Chill"
    },
    {
      id: 2,
      name: "Euphoric Dreams",
      trackCount: 45,
      isPublic: true,
      plays: "8.2K",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
      mood: "Upbeat"
    },
    {
      id: 3,
      name: "Lost in Melodies",
      trackCount: 89,
      isPublic: false,
      plays: "Private",
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      mood: "Melancholic"
    }
  ];

  const recentActivity = [
    {
      type: "liked",
      title: "Sapphire",
      artist: "Ed Sheeran",
      time: "2h ago",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop"
    },
    {
      type: "playlist",
      title: "Created 'Summer Nights'",
      artist: "24 tracks",
      time: "1d ago",
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=60&h=60&fit=crop"
    },
    {
      type: "follow",
      title: "Started following",
      artist: "Arctic Monkeys",
      time: "3d ago",
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop"
    }
  ];

  const topArtists = [
    { name: "Coldplay", plays: "156 plays", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop" },
    { name: "Ed Sheeran", plays: "134 plays", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&h=120&fit=crop" },
    { name: "The Weeknd", plays: "98 plays", cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop" }
  ];

  const renderOverview = () => (
    <div className="overview-section">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Heart />
          </div>
          <div className="stat-info">
            <h3>{userProfile.likedSongs}</h3>
            <p>Liked Songs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <List />
          </div>
          <div className="stat-info">
            <h3>{userProfile.playlistCount}</h3>
            <p>Playlists</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-info">
            <h3>{userProfile.followedArtists}</h3>
            <p>Following</p>
          </div>
        </div>
      </div>

      {/* Featured Playlists */}
      <div className="section-block">
        <div className="section-header">
          <h2>Featured Playlists</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="featured-playlists">
          {featuredPlaylists.map(playlist => (
            <div key={playlist.id} className="featured-playlist-card">
              <div className="playlist-artwork">
                <img src={playlist.cover} alt={playlist.name} />
                <div className="playlist-overlay">
                  <button className="play-btn-large">
                    <Play size={24} />
                  </button>
                  <div className="playlist-stats">
                    <span className="plays">{playlist.plays} plays</span>
                  </div>
                </div>
              </div>
              <div className="playlist-details">
                <span className="mood-tag">{playlist.mood}</span>
                <h3>{playlist.name}</h3>
                <p>{playlist.trackCount} tracks</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists & Activity */}
      <div className="dual-section">
        <div className="top-artists-section">
          <h3>Top Artists This Month</h3>
          <div className="top-artists-list">
            {topArtists.map((artist, index) => (
              <div key={index} className="top-artist-item">
                <span className="rank">#{index + 1}</span>
                <img src={artist.cover} alt={artist.name} />
                <div className="artist-info">
                  <h4>{artist.name}</h4>
                  <p>{artist.plays}</p>
                </div>
                <Star className="star-icon" size={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-feed">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'liked' && <Heart size={16} />}
                  {activity.type === 'playlist' && <List size={16} />}
                  {activity.type === 'follow' && <Users size={16} />}
                </div>
                <img src={activity.cover} alt="" />
                <div className="activity-info">
                  <h4>{activity.title}</h4>
                  <p>{activity.artist}</p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="artist-profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-main">
            <div className="profile-avatar">
              <img src={userProfile.profilePic} alt="Profile" />
              <button className="edit-avatar">
                <Edit3 size={16} />
              </button>
            </div>
            <div className="profile-identity">
              <h1>{userProfile.name}</h1>
              <p className="username">{userProfile.username}</p>
              <p className="bio">{userProfile.bio}</p>
              <div className="genre-tags">
                {userProfile.topGenres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="primary-btn">
              <Share2 size={18} />
              Share
            </button>
            <button className="secondary-btn">
              <Edit3 size={18} />
              Edit
            </button>
          </div>
        </div>
        
        {/* Social Stats */}
        <div className="social-stats">
          <div className="social-stat">
            <span className="number">{userProfile.followerCount}</span>
            <span className="label">Followers</span>
          </div>
          <div className="social-stat">
            <span className="number">{userProfile.followingCount}</span>
            <span className="label">Following</span>
          </div>
          <div className="social-stat">
            <span className="number">{userProfile.joinedDate}</span>
            <span className="label">Joined</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
   <div className="profile-navigation">
  {['overview', 'playlists', 'liked', 'activity'].map((key) => {
    const labelMap = {
      overview: 'Overview',
      playlists: 'Playlists',
      liked: 'Liked Songs',
      activity: 'Activity'
    };
    return (
      <button
        key={key}
        className={`nav-item${activeSection === key ? ' active' : ''}`}
        onClick={() => setActiveSection(key)}
      >
        {labelMap[key]}
      </button>
    );
  })}
</div>

      {/* Content */}
      <div className="profile-content">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'playlists' && (
          <div className="playlists-view">
            <div className="create-playlist-section">
              <button className="create-playlist-card">
                <Plus size={32} />
                <h3>Create New Playlist</h3>
                <p>Start curating your perfect mix</p>
              </button>
            </div>
            <div className="all-playlists-grid">
              {featuredPlaylists.map(playlist => (
                <div key={playlist.id} className="playlist-grid-item">
                  <img src={playlist.cover} alt={playlist.name} />
                  <div className="playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.trackCount} tracks • {playlist.plays} plays</p>
                  </div>
                  <button className="playlist-play-btn">
                    <Play size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection === 'liked' && (
          <div className="liked-songs-view">
            <div className="liked-header">
              <Heart className="liked-icon" size={48} />
              <div>
                <h2>Liked Songs</h2>
                <p>{userProfile.likedSongs} songs in your collection</p>
              </div>
            </div>
            <div className="songs-grid">
              {/* Songs would be mapped here */}
              <div className="song-placeholder">
                <p>Your liked songs will appear here</p>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'activity' && (
          <div className="activity-view">
            <h2>Your Music Journey</h2>
            <div className="activity-timeline">
              {recentActivity.map((activity, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <img src={activity.cover} alt="" />
                    <div>
                      <h4>{activity.title}</h4>
                      <p>{activity.artist} • {activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;



export const ProfilePageLoad = () => {
  return (
    <div className="artist-profile-page">
      {/* Hero Section Skeleton */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-main">
            <div className="profile-avatar">
              <Skeleton 
                variant="circular" 
                width={140} 
                height={140}
                sx={{ 
                  bgcolor: 'rgba(15, 215, 195, 0.1)',
                  border: '4px solid rgba(15, 215, 195, 0.2)'
                }}
              />
            </div>
            <div className="profile-identity">
              <Skeleton 
                variant="text" 
                width={300} 
                height={60}
                sx={{ 
                  fontSize: '3rem',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  marginBottom: '0.5rem'
                }}
              />
              <Skeleton 
                variant="text" 
                width={180} 
                height={30}
                sx={{ 
                  fontSize: '1.2rem',
                  bgcolor: 'rgba(15, 215, 195, 0.2)',
                  marginBottom: '1rem'
                }}
              />
              <Skeleton 
                variant="text" 
                width={400} 
                height={25}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  marginBottom: '0.5rem'
                }}
              />
              <Skeleton 
                variant="text" 
                width={320} 
                height={25}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  marginBottom: '1.5rem'
                }}
              />
              <div className="genre-tags">
                {[1, 2, 3, 4].map(index => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={60 + index * 10}
                    height={28}
                    sx={{
                      bgcolor: 'rgba(15, 215, 195, 0.1)',
                      borderRadius: '15px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <Skeleton
              variant="rounded"
              width={120}
              height={45}
              sx={{
                bgcolor: 'rgba(15, 215, 195, 0.2)',
                borderRadius: '25px'
              }}
            />
            <Skeleton
              variant="rounded"
              width={120}
              height={45}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '25px'
              }}
            />
          </div>
        </div>
        
        {/* Social Stats Skeleton */}
        <div className="social-stats">
          {[1, 2, 3].map(index => (
            <div key={index} className="social-stat">
              <Skeleton
                variant="text"
                width={60}
                height={40}
                sx={{
                  fontSize: '1.8rem',
                  bgcolor: 'rgba(15, 215, 195, 0.2)',
                  marginBottom: '0.25rem'
                }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{
                  fontSize: '0.9rem',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="profile-navigation">
        {['Overview', 'Playlists', 'Liked Songs', 'Activity'].map((item, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={item.length * 8 + 20}
            height={30}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              margin: '1.5rem 0'
            }}
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="profile-content">
        <div className="overview-section">
          {/* Stats Grid Skeleton */}
          <div className="stats-grid">
            {[1, 2, 3, 4].map(index => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <Skeleton
                    variant="rounded"
                    width={50}
                    height={50}
                    sx={{
                      bgcolor: 'rgba(15, 215, 195, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <div className="stat-info">
                  <Skeleton
                    variant="text"
                    width={80}
                    height={35}
                    sx={{
                      fontSize: '1.8rem',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      marginBottom: '0.25rem'
                    }}
                  />
                  <Skeleton
                    variant="text"
                    width={100}
                    height={20}
                    sx={{
                      fontSize: '0.9rem',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Featured Playlists Skeleton */}
          <div className="section-block">
            <div className="section-header">
              <Skeleton
                variant="text"
                width={200}
                height={45}
                sx={{
                  fontSize: '2rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }}
              />
              <Skeleton
                variant="rounded"
                width={80}
                height={35}
                sx={{
                  bgcolor: 'rgba(15, 215, 195, 0.1)',
                  borderRadius: '15px'
                }}
              />
            </div>
            <div className="featured-playlists">
              {[1, 2, 3].map(index => (
                <div key={index} className="featured-playlist-card">
                  <div className="playlist-artwork">
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={250}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                  <div className="playlist-details">
                    <Skeleton
                      variant="rounded"
                      width={60}
                      height={20}
                      sx={{
                        bgcolor: 'rgba(255, 0, 174, 0.2)',
                        borderRadius: '10px',
                        marginBottom: '0.75rem'
                      }}
                    />
                    <Skeleton
                      variant="text"
                      width={180}
                      height={30}
                      sx={{
                        fontSize: '1.3rem',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <Skeleton
                      variant="text"
                      width={120}
                      height={20}
                      sx={{
                        fontSize: '0.9rem',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Section Skeleton */}
          <div className="dual-section">
            {/* Top Artists Section Skeleton */}
            <div className="top-artists-section">
              <Skeleton
                variant="text"
                width={180}
                height={35}
                sx={{
                  fontSize: '1.4rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  marginBottom: '1.5rem'
                }}
              />
              <div className="top-artists-list">
                {[1, 2, 3].map(index => (
                  <div key={index} className="top-artist-item">
                    <Skeleton
                      variant="text"
                      width={30}
                      height={25}
                      sx={{
                        fontSize: '1.1rem',
                        bgcolor: 'rgba(15, 215, 195, 0.2)'
                      }}
                    />
                    <Skeleton
                      variant="rounded"
                      width={50}
                      height={50}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <div className="artist-info">
                      <Skeleton
                        variant="text"
                        width={100}
                        height={25}
                        sx={{
                          fontSize: '1rem',
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          marginBottom: '0.25rem'
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={80}
                        height={18}
                        sx={{
                          fontSize: '0.85rem',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </div>
                    <Skeleton
                      variant="circular"
                      width={16}
                      height={16}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Section Skeleton */}
            <div className="activity-section">
              <Skeleton
                variant="text"
                width={150}
                height={35}
                sx={{
                  fontSize: '1.4rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  marginBottom: '1.5rem'
                }}
              />
              <div className="activity-feed">
                {[1, 2, 3].map(index => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <Skeleton
                        variant="rounded"
                        width={32}
                        height={32}
                        sx={{
                          bgcolor: 'rgba(15, 215, 195, 0.2)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <Skeleton
                      variant="rounded"
                      width={40}
                      height={40}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px'
                      }}
                    />
                    <div className="activity-info">
                      <Skeleton
                        variant="text"
                        width={120}
                        height={22}
                        sx={{
                          fontSize: '0.95rem',
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          marginBottom: '0.25rem'
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={90}
                        height={18}
                        sx={{
                          fontSize: '0.8rem',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </div>
                    <Skeleton
                      variant="text"
                      width={40}
                      height={16}
                      sx={{
                        fontSize: '0.75rem',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

