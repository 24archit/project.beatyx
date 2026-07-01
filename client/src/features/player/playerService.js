import { apiClient } from "../../services/api";

import { getAuthHeaders } from "@/services/api";

/**
 * Fetches the audio source link for a track and updates the player queue if it's a playlist.
 * @param {string} id - The Track ID.
 * @param {boolean} isPlaylist - Whether the track is part of a playlist.
 * @param {number} index - The index of the track in the list.
 * @param {string} currPlaylistId - The current playlist ID.
 * @param {string} queueId - The queue session ID.
 * @returns {Promise<Object>} Audio URL data.
 * @throws {Error} If fetch fails.
 */
export async function getAudioLink(id, isPlaylist, index, currPlaylistId, queueId) {
  try {
    if (isPlaylist) {
      await updatePlayerQueue(index, currPlaylistId, queueId);
    }
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getAudioLink/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching audio link of id: ${id}: ${error.message}`);
  }
}

/**
 * Updates the player queue on the backend.
 * @param {number} index - The current track index.
 * @param {string} currPlaylistId - The current playlist ID.
 * @param {string} queueId - The queue session ID.
 * @returns {Promise<Object>} Updated queue data.
 * @throws {Error} If update fails.
 */
export async function updatePlayerQueue(index, currPlaylistId, queueId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/updatePlayerQueue`,
      method: "PUT",
      data: {
        index: index,
        currPlaylistId: currPlaylistId,
        queueId: queueId,
      },
      headers: getAuthHeaders(),
    });
    window.sessionStorage.setItem("queueId", response.data.queueId);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating player queue: ${error.message}`);
  }
}

/**
 * Fetches the next audio link from the queue.
 * @param {string} queueId - The queue session ID.
 * @returns {Promise<Object>} Next track audio URL.
 * @throws {Error} If fetch fails.
 */
export async function getNextAudioLink(queueId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getNextAudioLink/${queueId}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching next audio link: ${error.message}`);
  }
}

/**
 * Fetches the previous audio link from the queue.
 * @param {string} queueId - The queue session ID.
 * @returns {Promise<Object>} Previous track audio URL.
 * @throws {Error} If fetch fails.
 */
export async function getPreviousAudioLink(queueId) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getPreviousAudioLink/${queueId}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching previous audio link: ${error.message}`);
  }
}

/**
 * Fetches detailed track information.
 * @param {string} id - The Track ID.
 * @returns {Promise<Object>} Track info including recommendations.
 * @throws {Error} If fetch fails.
 */
export async function getTrackInfo(id) {
  try {
    const response = await apiClient({
      url: `${import.meta.env.VITE_SERVER_LINK}/track/api/getTrackInfo/${id}`,
      method: "GET",
      headers: getAuthHeaders(),
    });
    // Set current playlist ID for the player context
    window.sessionStorage.setItem("currPlaylistId", response.data.currPlaylistId);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching track info: ${error.message}`);
  }
}
