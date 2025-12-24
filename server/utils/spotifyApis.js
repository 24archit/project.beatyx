// server/utils/spotifyApis.js
const axios = require("axios");
// Ensure you have installed this package: npm install axios-retry
const axiosRetry = require("axios-retry").default; 

const { getFreshTokens } = require("./getFreshTokens");
const { getArtistShows } = require("./getArtistShows");
const { getAccessToken } = require("./getAccessToken");

// ==================================================================
// 1. Axios Instance & Configuration
// ==================================================================

const spotifyClient = axios.create();

// A. Retry Interceptor (Handles 5xx, Network Errors)
axiosRetry(spotifyClient, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay, // Wait 1s, then 2s, then 4s...
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status >= 500);
  }
});

// B. Response Interceptor (Handles 401 Unauthorized Automatically)
spotifyClient.interceptors.response.use(
  (response) => response, // Return successful responses as is
  async (error) => {
    const originalRequest = error.config;

    // If 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 401 Detected. Refreshing Token...");
      originalRequest._retry = true;

      try {
        // 1. Generate new token in DB
        await getFreshTokens(); 
        
        // 2. Fetch the NEW token string
        const newToken = await getAccessToken(); 

        // 3. Update auth header
        if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            console.log("Header updated with fresh token.");
            
            // 4. Retry original request with new token
            return spotifyClient(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ==================================================================
// 2. API Functions
// ==================================================================

// Function to fetch top tracks in India
async function getTopTracksIndia(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbLZ52XmnySJg";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// Function to fetch top tracks globally
async function getTopTracksGlobal(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// Function to fetch artist info (Combines multiple requests)
async function getArtistInfo(id, rightAccessToken, retries = 4, delay = 800) {
  const artistDataUrl = `https://api.spotify.com/v1/artists/${id}`;
  const topTracksUrl = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`;
  const albumsUrl = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=single%2Calbum%2Cappears_on%2Ccompilation&market=IN&limit=8&offset=0`;
  
  const headers = { Authorization: `Bearer ${rightAccessToken}` };

  // Parallel execution could be used here, but keeping sequential to match original logic strictness
  const { data: artistData } = await spotifyClient.get(artistDataUrl, { headers });
  
  // Note: getArtistShows is imported, assuming it handles its own logic/requests
  const artistShows = await getArtistShows(id, rightAccessToken, artistData.name);
  
  const { data: topTracks } = await spotifyClient.get(topTracksUrl, { headers });
  const { data: albums } = await spotifyClient.get(albumsUrl, { headers });

  return { ArtistData: artistData, ArtistTopTracks: topTracks, ArtistTopAlbums: albums, ArtistShows: artistShows };
}

// Function to fetch search results
async function getSearchResult(query, type, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&market=IN&limit=9`;
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// Function to fetch playlist details
async function getPlaylist(id, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/playlists/${id}?market=IN&fields=name,description,public,external_urls.spotify,owner(display_name,id,type),images.url,tracks.items(track(name,artists(name,id),external_urls.spotify,id,duration_ms,album(images.url)))`;
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// Function to get album details
async function getAlbum(id, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/albums/${id}`;
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

async function getCurrentUserInfo(accessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/me";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// --- NEW FUNCTIONS BELOW ---

// 1. Get New Releases
async function getNewReleases(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/browse/new-releases?country=IN&limit=20";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// 2. Get Featured Playlists
async function getFeaturedPlaylists(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/browse/featured-playlists?country=IN&limit=15";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// 3. Get Categories
async function getCategories(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/browse/categories?country=IN&locale=en_IN&limit=20";
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

// 4. Get Category Playlists (Standard)
async function getCategoryPlaylists(id, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/browse/categories/${id}/playlists?country=IN&limit=20`;

  try {
    const { data } = await spotifyClient.get(url, {
      headers: {
        Authorization: `Bearer ${rightAccessToken}`,
        "Content-Type": "application/json",
      }
    });
    
    if (!data.playlists) {
      return { playlists: { items: [] } };
    }
    return data;
  } catch (error) {
    console.warn(`Category '${id}' fetch failed:`, error.message);
    return { playlists: { items: [] } };
  }
}

async function getUserTopArtists(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/me/top/artists?limit=10"; 
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

async function getUserTopTracks(rightAccessToken, retries = 4, delay = 800) {
  const url = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10"; 
  const { data } = await spotifyClient.get(url, {
    headers: { 
        Authorization: `Bearer ${rightAccessToken}`, 
        "Content-Type": "application/json" 
    }
  });
  return data;
}

async function getTrack(id, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/tracks/${id}`;
  const { data } = await spotifyClient.get(url, {
    headers: { Authorization: `Bearer ${rightAccessToken}` }
  });
  return data;
}

// Function to fetch recommendations (Using official API)
async function getRecommendations(seedTrackId, seedArtistId, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrackId}&seed_artists=${seedArtistId}&limit=20&market=IN`;
  const { data } = await spotifyClient.get(url, {
    headers: { Authorization: `Bearer ${rightAccessToken}` }
  });
  return data;
}

// Function to fetch Artist Top Tracks (Reusable helper)
async function getArtistTopTracks(artistId, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=IN`;
  const { data } = await spotifyClient.get(url, {
    headers: { Authorization: `Bearer ${rightAccessToken}` }
  });
  return data;
}

async function getSeveralTracks(ids, rightAccessToken, retries = 4, delay = 800) {
  const url = `https://api.spotify.com/v1/tracks?ids=${ids}&market=IN`;
  const { data } = await spotifyClient.get(url, {
    headers: { Authorization: `Bearer ${rightAccessToken}` }
  });
  return data;
}

// Export all functions
module.exports = {
  getTopTracksIndia,
  getTopTracksGlobal,
  getArtistInfo,
  getSearchResult,
  getPlaylist,
  getAlbum,
  getCurrentUserInfo,
  getSeveralTracks,
  getNewReleases,
  getFeaturedPlaylists,
  getCategories,
  getCategoryPlaylists,
  getUserTopArtists,
  getUserTopTracks,
  getTrack,
  getRecommendations,
  getArtistTopTracks
};