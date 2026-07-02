import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";

// Apply API_SECRET header globally to all Axios requests
axios.defaults.headers.common["x-api-secret"] = import.meta.env.VITE_API_SECRET;

// Clear cache on session close to prevent stale image loading issues
window.addEventListener("beforeunload", () => {
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
