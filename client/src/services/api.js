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
  config.headers["x-api-secret"] = import.meta.env.VITE_API_SECRET;
  return config;
});

// Response interceptor with exponential backoff retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Set a default max retry count if not already set
    if (!config) return Promise.reject(error);

    if (!config.retry) {
      config.retry = {
        count: 0,
        maxRetries: 3,
        delay: 1000, // initial delay of 1s
      };
    }

    // If it's a 4xx error (client error like 401, 404, 400), we probably shouldn't retry,
    // unless it's a 429 Too Many Requests.
    const isRetryableError = error.response
      ? error.response.status >= 500 || error.response.status === 429
      : true;

    if (isRetryableError && config.retry.count < config.retry.maxRetries) {
      config.retry.count += 1;

      // Exponential backoff
      const delay = config.retry.delay * Math.pow(2, config.retry.count - 1);

      console.warn(
        `API call failed. Retrying (${config.retry.count}/${config.retry.maxRetries}) in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // Alert the user if we have exhausted retries and it was a retryable (network or server) error
    if (isRetryableError && config.retry.count >= config.retry.maxRetries) {
      alert(
        "Permanent server error or network issue. Please check your connection or try again later."
      );
    }

    return Promise.reject(error);
  }
);
