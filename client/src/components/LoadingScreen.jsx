import React from "react";
import ReactLoading from "react-loading";

const LoadingScreen = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#00001a", // Optional: Add a background color for better visibility
      }}
    >
      <ReactLoading type="balls" color="#fff" />
    </div>
  );
};

export default LoadingScreen;
