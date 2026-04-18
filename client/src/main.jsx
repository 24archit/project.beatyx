import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

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
