import React, { useState } from "react";
import "../assets/styles/LazyImage.css";

export const LazyImage = ({ src, alt, className = "", style = {} }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`lazy-image-container ${!isLoaded ? "is-loading" : ""} ${className}`}
      style={style}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`lazy-image ${isLoaded ? "is-loaded" : ""}`}
      />
    </div>
  );
};
