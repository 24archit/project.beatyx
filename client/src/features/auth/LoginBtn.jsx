import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import "./LoginBtn.css";

export default function LoginBtn() {
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (e && e.target) e.target.blur();
    navigate("/login");
  };

  // Listen for custom event from hamburger drawer (if needed)
  React.useEffect(() => {
    const handler = () => navigate("/login");
    document.addEventListener("openLoginDialog", handler);
    return () => document.removeEventListener("openLoginDialog", handler);
  }, [navigate]);

  return (
    <div className="login-btn-container">
      <button id="logout-btn" className="auth-trigger-btn" onClick={handleLoginClick}>
        Login
      </button>
    </div>
  );
}
