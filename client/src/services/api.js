// This file will hold the base Axios instance and interceptors if needed.
import axios from "axios";

export function getAuthHeaders() {
  const token = window.localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Create a configured axios instance (optional, but good practice)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_LINK,
});

apiClient.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers.Authorization = headers.Authorization;
  return config;
});
