const UniToken = require("../models/uniToken");
const axios = require("axios");
const { getFreshTokens } = require("./getFreshTokens");

async function getTopTracksIndia() {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response = await axios.get(
      "https://api.spotify.com/v1/playlists/37i9dQZEVXbLZ52XmnySJg",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching top tracks India: Status Code from Spotify : ",
      error.response?.status || error.message
    );

    if (error.response?.status === 401) {
      await getFreshTokens();
    }
    return null;
  }
}

async function getTopTracksGlobal() {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response = await axios.get(
      "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching top tracks Global: Status Code from Spotify : ",
      error.response?.status || error.message
    );

    if (error.response?.status === 401) {
      await getFreshTokens();
    }
    return null;
  }
}

async function getArtistInfo(id) {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response1 = await axios.get(
      `https://api.spotify.com/v1/artists/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const response2 = await axios.get(
      `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const response3 = await axios.get(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=single%2Calbum%2Cappears_on%2Ccompilation&market=IN&limit=10&offset=0`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const response = {
      ArtistData: response1.data,
      ArtistTopTracks: response2.data,
      ArtistTopAlbums: response3.data,
    };
    return response;
  } catch (error) {
    console.error(
      "Error fetching artist info: Status Code from Spotify : ",
      error.response?.status || error.message
    );

    if (error.response?.status === 401) {
      await getFreshTokens();
    }
    return null;
  }
}

async function getSearchResult(query, type) {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${query}&type=${type}&market=IN&limit=9`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching search results: Status Code from Spotify : ",
      error.response?.status || error.message
    );

    if (error.response?.status === 401) {
      await getFreshTokens();
    }
    return null;
  }
}

async function getPlaylist(id) {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${id}?market=IN&fields=name,description,public,external_urls.spotify,owner(display_name,id,type),images.url,tracks.items(track(name,artists(name,id),external_urls.spotify,id,duration_ms,album(images.url)))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching playlist: Status Code from Spotify : ",
      error.response?.status || error.message
    );

    if (error.response?.status === 401) {
      await getFreshTokens();
    }
    return null;
  }
}

module.exports = {
  getTopTracksIndia,
  getTopTracksGlobal,
  getArtistInfo,
  getSearchResult,
  getPlaylist,
};
