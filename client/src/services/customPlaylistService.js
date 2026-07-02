import { apiClient } from "./api";

const BASE_URL = "/custom-playlist/api/custom-playlists";

export const createCustomPlaylist = async (data) => {
  const response = await apiClient.post(BASE_URL, data);
  return response.data.playlist;
};

export const getMyCustomPlaylists = async () => {
  const response = await apiClient.get(`${BASE_URL}/me`);
  return response.data.playlists;
};

export const getCustomPlaylist = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.playlist;
};

export const updateCustomPlaylist = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data);
  return response.data.playlist;
};

export const deleteCustomPlaylist = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const addTrackToCustomPlaylist = async (playlistId, trackData) => {
  const response = await apiClient.post(`${BASE_URL}/${playlistId}/tracks`, trackData);
  return response.data.playlist;
};

export const removeTrackFromCustomPlaylist = async (playlistId, trackId) => {
  const response = await apiClient.delete(`${BASE_URL}/${playlistId}/tracks/${trackId}`);
  return response.data.playlist;
};

export const searchCustomPlaylists = async (query) => {
  if (!query) return [];
  const response = await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  return response.data.playlists;
};

export const saveCustomPlaylist = async (id) => {
  const response = await apiClient.post(`${BASE_URL}/save/${id}`);
  return response.data.savedPlaylists;
};

export const unsaveCustomPlaylist = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/save/${id}`);
  return response.data.savedPlaylists;
};

export const getMySavedPlaylists = async () => {
  const response = await apiClient.get(`${BASE_URL}/saved/me`);
  return response.data; // { customSavedPlaylists, spotifySavedPlaylistIds }
};
