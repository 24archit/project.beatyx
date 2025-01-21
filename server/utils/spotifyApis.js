const UniToken = require("../models/uniToken");
const axios = require("axios");
const { getFreshTokens } = require("./getFreshTokens");

// Utility function to validate tokens
async function getAccessToken() {
  const Token = await UniToken.find();
  if (!Token || Token.length === 0 || !Token[0].accessToken) {
    throw new Error("Access token not found. Ensure tokens are initialized properly.");
  }
  return Token[0].accessToken;
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

// Fetch top tracks for India
async function getTopTracksIndia(retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbLZ52XmnySJg";

  return makeApiRequest(url, "GET", {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }, retries, delay);
}

// Fetch top tracks globally
async function getTopTracksGlobal(retries = 4, delay = 800) {
  const accessToken = await getAccessToken();
  const url = "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF";

  return makeApiRequest(url, "GET", {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }, retries, delay);
}

// Fetch artist information
async function getArtistInfo(id, retries = 4, delay = 800) {
  if (!id) throw new Error("Artist ID is required.");
  const accessToken = await getAccessToken();

  const urls = [
    `https://api.spotify.com/v1/artists/${id}`,
    `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`,
    `https://api.spotify.com/v1/artists/${id}/albums?include_groups=single,album,appears_on,compilation&market=IN&limit=10&offset=0`,
  ];

  const [ArtistData, ArtistTopTracks, ArtistTopAlbums] = await Promise.all(
    urls.map((url) =>
      makeApiRequest(url, "GET", {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }, retries, delay)
    )
  );

  return { ArtistData, ArtistTopTracks, ArtistTopAlbums };
}

// Fetch search results
async function getSearchResult(query, type, retries = 4, delay = 800) {
  if (!query || !type) throw new Error("Query and type are required.");
  const accessToken = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&market=IN&limit=9`;

  return makeApiRequest(url, "GET", {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }, retries, delay);
}

// Fetch playlist
async function getPlaylist(id, retries = 4, delay = 800) {
  if (!id) throw new Error("Playlist ID is required.");
  const accessToken = await getAccessToken();
  const url = `https://api.spotify.com/v1/playlists/${id}?market=IN&fields=name,description,public,external_urls.spotify,owner(display_name,id,type),images.url,tracks.items(track(name,artists(name,id),external_urls.spotify,id,duration_ms,album(images.url)))`;

  return makeApiRequest(url, "GET", {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }, retries, delay);
}

module.exports = {
  getTopTracksIndia,
  getTopTracksGlobal,
  getArtistInfo,
  getSearchResult,
  getPlaylist,
};
