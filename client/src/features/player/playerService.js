import { apiClient } from "../../services/api";

import { getAuthHeaders } from "@/services/api";

/**
 * Fetches the audio source link for a track.
 * @param {string} id - The Track ID.
 * @returns {Promise<Object>} Audio URL data.
 * @throws {Error} If fetch fails.
 */
export async function getAudioLink(id) {
  try {
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
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching track info: ${error.message}`);
  }
}
