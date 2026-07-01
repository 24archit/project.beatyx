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
