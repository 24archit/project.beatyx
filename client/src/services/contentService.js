import { apiClient } from "./api";

import { getAuthHeaders } from "./api";

/**
 * Fetches top tracks in India.
 * @returns {Promise<Object>} Top tracks data.
 * @throws {Error} If fetch fails.
 */
export async function getTopTracksIndia() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getTopTracksIndia`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches global top tracks.
 * @returns {Promise<Object>} Top tracks data.
 * @throws {Error} If fetch fails.
 */
export async function getTopTracksGlobal() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getTopTracksGlobal`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches artist information by ID.
 * @param {string} id - The Spotify Artist ID.
 * @returns {Promise<Object>} Artist data including top tracks and albums.
 * @throws {Error} If fetch fails.
 */
export async function getArtistInfo(id) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/artist/api/getArtistInfo/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching artist data for id ${id}: ${error.message}`);
  }
}

/**
 * Search for items on Spotify.
 * @param {string} query - The search query.
 * @param {string} type - The types to search for (comma separated).
 * @returns {Promise<Object>} Search results.
 * @throws {Error} If search fails.
 */
export async function getSearchResult(query, type) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/search/api/getSearchResult?q=${query}&type=${type}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching search results for query ${query}: ${error.message}`);
  }
}

/**
 * Fetches playlist information by ID.
 * @param {string} id - The Playlist ID.
 * @returns {Promise<Object>} Playlist data.
 * @throws {Error} If fetch fails.
 */
export async function getPlaylistInfo(id) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/playlist/api/getPlaylistInfo/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    window.sessionStorage.setItem("currPlaylistId", response.data.currPlaylistId);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching playlist data for id ${id}: ${error.message}`);
  }
}

/**
 * Fetches album information by ID.
 * @param {string} id - The Album ID.
 * @returns {Promise<Object>} Album data.
 * @throws {Error} If fetch fails.
 */
export async function getAlbumInfo(id) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/album/api/getAlbumInfo/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching album data for id ${id}: ${error.message}`);
  }
}

/**
 * Fetches new music releases.
 * @returns {Promise<Object>} New releases data.
 * @throws {Error} If fetch fails.
 */
export async function getNewReleases() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getNewReleases`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches featured playlists.
 * @returns {Promise<Object>} Featured playlists data.
 * @throws {Error} If fetch fails.
 */
export async function getFeaturedPlaylists() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getFeaturedPlaylists`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches browsing categories.
 * @returns {Promise<Object>} Categories data.
 */
export async function getCategories() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getCategories`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Categories fetch error", error);
    return { categories: { items: [] } };
  }
}

/**
 * Fetches playlists for a specific category.
 * @param {string} id - The Category ID.
 * @returns {Promise<Object>} Category playlists.
 * @throws {Error} If fetch fails.
 */
export async function getCategoryPlaylists(id) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getCategoryPlaylists/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
