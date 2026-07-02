import { apiClient } from "./api";
import { getAuthHeaders } from "./api";
// Using axios directly for now until we migrate everything to apiClient

/**
 * Fetches the current user's profile.
 * @returns {Promise<Object>} User profile data.
 * @throws {Error} If fetch fails.
 */
export async function getUserProfile() {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/profile`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Adds a song to the user's liked songs.
 * @param {string} trackId - The Track ID to add.
 * @returns {Promise<Object>} Success status.
 * @throws {Error} If action fails.
 */
export async function addLikedSong(trackId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/addLikedSong`,
      method: "PUT",
      data: { trackId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Removes a song from the user's liked songs.
 * @param {string} trackId - The Track ID to remove.
 * @returns {Promise<Object>} Success status.
 * @throws {Error} If action fails.
 */
export async function removeLikedSong(trackId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/removeLikedSong`,
      method: "PUT",
      data: { trackId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches the user's liked songs.
 * @returns {Promise<Object>} Liked songs data.
 */
export async function getLikedSongs() {
  const token = window.localStorage.getItem("authToken");
  if (!token) return { likedSongs: [], items: [] };

  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/getLikedSongs`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    return { likedSongs: [], items: [] };
  }
}

/**
 * Follows an artist.
 * @param {string} artistId - The Artist ID to follow.
 * @returns {Promise<Object>} Success status.
 */
export async function followArtist(artistId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/followArtist`,
      method: "PUT",
      data: { artistId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Unfollows an artist.
 * @param {string} artistId - The Artist ID to unfollow.
 * @returns {Promise<Object>} Success status.
 */
export async function unfollowArtist(artistId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/unfollowArtist`,
      method: "PUT",
      data: { artistId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetches the user's followed artists.
 * @param {boolean} idsOnly - If true, only fetches IDs and not full details.
 * @returns {Promise<Object>} Followed artists data.
 */
export async function getFollowedArtists(idsOnly = false) {
  const token = window.localStorage.getItem("authToken");
  if (!token) return { followedArtists: [], items: [] };

  try {
    const url = idsOnly
      ? `${import.meta.env.VITE_SERVER_LINK}/user/getFollowedArtists?idsOnly=true`
      : `${import.meta.env.VITE_SERVER_LINK}/user/getFollowedArtists`;
    const response = await apiClient({
      url,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching followed artists:", error);
    return { followedArtists: [], items: [] };
  }
}

/**
 * Adds an album to the user's saved albums.
 * @param {string} albumId - The Album ID to add.
 * @returns {Promise<Object>} Success status.
 */
export async function addSavedAlbum(albumId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/addSavedAlbum`,
      method: "PUT",
      data: { albumId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Removes an album from the user's saved albums.
 * @param {string} albumId - The Album ID to remove.
 * @returns {Promise<Object>} Success status.
 */
export async function removeSavedAlbum(albumId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/user/removeSavedAlbum`,
      method: "PUT",
      data: { albumId },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
