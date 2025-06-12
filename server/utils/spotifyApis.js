const mongoose = require("mongoose");
const axios = require("axios");
const UniToken = require("../models/uniToken");
const { getFreshTokens } = require("./getFreshTokens");

const TOKEN_EXPIRY_TIME = 50 * 60 * 1000; // 50 minutes in milliseconds

// Utility function to validate or refresh tokens
async function getAccessToken() {
  const Token = await UniToken.findOne(); // Assuming there's only one token document.
  if (!Token) {
    throw new Error("Token not found. Please initialize the token collection.");
  }

  const currentTime = new Date();
  const tokenAge = currentTime - new Date(Token.updationTime);

  // Check if token is expired
  if (tokenAge >= TOKEN_EXPIRY_TIME) {
    console.log("Token expired. Generating a fresh token...");
    await getFreshTokens(); // Refresh tokens and update the database
    const updatedToken = await UniToken.findOne(); // Re-fetch the updated token
    if (!updatedToken || !updatedToken.accessToken) {
      throw new Error("Failed to refresh the token. Please check the refresh logic.");
    }
    return updatedToken.accessToken;
  }

  return Token.accessToken;
}

// Generic function to handle retries and API requests
async function makeApiRequest(url, method = "GET", headers = {}, retries = 4, delay = 800) {
  try {
    const response = await axios({
      url,
      method,
      headers,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status || error.message;
    console.error(`Error with API request: ${url}. Status: ${status}`);

    if (status === 401) {
      console.log("Refreshing access tokens...");
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying API request... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return makeApiRequest(url, method, headers, retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not complete the API request.");
      throw error;
    }
  }
}

// Function to fetch top tracks in India
async function getTopTracksIndia(retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbLZ52XmnySJg";

  return makeApiRequest(
    url,
    "GET",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    retries,
    delay
  );
}

// Function to fetch top tracks globally
async function getTopTracksGlobal(retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF";

  return makeApiRequest(
    url,
    "GET",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    retries,
    delay
  );
}

// Function to fetch artist info
async function getArtistInfo(id, retries = 4, delay = 800) {
  const accessToken = await getAccessToken();

  const artistDataUrl = `https://api.spotify.com/v1/artists/${id}`;
  const topTracksUrl = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`;
  const albumsUrl = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=single%2Calbum%2Cappears_on%2Ccompilation&market=IN&limit=8&offset=0`;

  const artistData = await makeApiRequest(
    artistDataUrl,
    "GET",
    { Authorization: `Bearer ${accessToken}` },
    retries,
    delay
  );

  const topTracks = await makeApiRequest(
    topTracksUrl,
    "GET",
    { Authorization: `Bearer ${accessToken}` },
    retries,
    delay
  );

  const albums = await makeApiRequest(
    albumsUrl,
    "GET",
    { Authorization: `Bearer ${accessToken}` },
    retries,
    delay
  );

  return {
    ArtistData: artistData,
    ArtistTopTracks: topTracks,
    ArtistTopAlbums: albums,
  };
}

// Function to fetch search results
async function getSearchResult(query, type, retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&market=IN&limit=9`;

  return makeApiRequest(
    url,
    "GET",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    retries,
    delay
  );
}

// Function to fetch playlist details
async function getPlaylist(id, retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = `https://api.spotify.com/v1/playlists/${id}?market=IN&fields=name,description,public,external_urls.spotify,owner(display_name,id,type),images.url,tracks.items(track(name,artists(name,id),external_urls.spotify,id,duration_ms,album(images.url)))`;

  return makeApiRequest(
    url,
    "GET",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    retries,
    delay
  );
}
// Function to get album details
async function getAlbum(id, retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = `https://api.spotify.com/v1/albums/${id}`;

  return makeApiRequest(
    url,
    "GET",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    retries,
    delay
  );
}

// Export all functions
module.exports = {
  getTopTracksIndia,
  getTopTracksGlobal,
  getArtistInfo,
  getSearchResult,
  getPlaylist,
  getAlbum,
};
