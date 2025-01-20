const UniToken = require("../models/uniToken");
const axios = require("axios");
const { getFreshTokens } = require("./getFreshTokens");

async function getTopTracksIndia(retries = 4, delay = 800) {
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
    console.error("Error fetching top tracks: Status Code from Spotify : ", error.response?.status || error.message);

    if (error.response?.status === 401) {
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying to fetch top tracks India... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getTopTracksIndia(retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not fetch top tracks India.");
      throw error;
    }
  }
}

async function getTopTracksGlobal(retries = 4, delay = 800) {
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
    console.error("Error fetching top tracks: Status Code from Spotify : ", error.response?.status || error.message);

    if (error.response?.status === 401) {
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying to fetch top tracks Global... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getTopTracksGlobal(retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not fetch top tracks Global.");
      throw error;
    }
  }
}

async function getArtistInfo(id, retries = 4, delay = 800) {
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
    console.error("Error fetching artist info: Status Code from Spotify : ", error.response?.status || error.message);

    if (error.response?.status === 401) {
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying to fetch artist info... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getArtistInfo(id, retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not fetch artist info.");
      throw error;
    }
  }
}

async function getSearchResult(query, type, retries = 4, delay = 800) {
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
    console.error("Error fetching search results: Status Code from Spotify: ", error.response?.status || error.message);

    if (error.response?.status === 401) {
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying to fetch search results... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getSearchResult(query, type, retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not fetch search results.");
      throw error;
    }
  }
}

async function getPlaylist(id, retries = 4, delay = 800) {
  try {
    const Token = await UniToken.find();
    const accessToken = Token[0].accessToken;

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${id}?market=IN&fields=name,description,public,external_urls.spotify,owner(display_name,id,type)images.url,tracks.items(track(name,artists(name,id),external_urls.spotify,id,duration_ms,album(images.url)))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist: Status Code from Spotify : ", error.response?.status || error.message);

    if (error.response?.status === 401) {
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying to fetch playlist... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getPlaylist(id, retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not fetch playlist.");
      throw error;
    }
  }
}

module.exports = { getTopTracksIndia, getTopTracksGlobal, getArtistInfo, getSearchResult, getPlaylist };