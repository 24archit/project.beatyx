import { apiClient } from "../../services/api";

import { getAuthHeaders } from "@/services/api";

/**
 * Registers a new user.
 * @param {Object} FormData - The user registration data.
 * @returns {Promise<Object>} Verification status or error object.
 */
export async function getSignUp(FormData) {
  try {
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/signup`,
      data: FormData,
      headers: getAuthHeaders(),
    };
    const response = await apiClient(config);
    if (response.status == 201) {
      window.localStorage.setItem("authToken", response.data.authToken);
      // Return an object indicating success
      return { success: true };
    }
  } catch (error) {
    // Return an object indicating failure, with the status code
    return {
      success: false,
      status: error.response ? error.response.status : 500,
    };
  }
}

/**
 * Logs in a user.
 * @param {Object} FormData - The user login credentials.
 * @returns {Promise<Object>} Login response data or error response.
 */
export async function getLoggedIn(FormData) {
  try {
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/login`,
      data: FormData,
      headers: getAuthHeaders(),
    };
    const response = await apiClient(config);
    if (response.status == 200) {
      window.localStorage.setItem("authToken", response.data.authToken);
      return response.data;
    }
  } catch (error) {
    return error.response;
  }
}

/**
 * Verifies the current authentication token.
 * @returns {Promise<Object>} Verification status and Spotify connection status.
 */
export async function verifyAuth() {
  // 1. Check local storage first
  const token = window.localStorage.getItem("authToken");

  // 2. If no token, or it's "null"/"undefined", stop immediately.
  if (!token || token === "null" || token === "undefined") {
    return { isVerified: false, spotifyConnect: false };
  }

  try {
    const config = {
      method: "GET",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/verifyauth`,
      headers: {
        Authorization: `Bearer ${token}`, // Manually set header here to be safe
      },
    };
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    console.error("Auth check failed:", error.response?.data || error.message);
    localStorage.removeItem("authToken"); // Clean up bad token
    return { isVerified: false, spotifyConnect: false };
  }
}
