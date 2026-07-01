import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import "./SignUpBtn.css";

export default function SignUpBtn() {
  const navigate = useNavigate();

  const handleSignUpClick = (e) => {
    e.preventDefault();
    if (e && e.target) e.target.blur();
    navigate("/signup");
  };

  // Listen for custom event from hamburger drawer (if needed)
  React.useEffect(() => {
    const handler = () => navigate("/signup");
    document.addEventListener("openSignupDialog", handler);
    return () => document.removeEventListener("openSignupDialog", handler);
  }, [navigate]);

  return (
    <div className="signup-btn-container">
      <button id="logout-btn" className="signup-trigger-btn" onClick={handleSignUpClick}>
        Sign Up
      </button>
    </div>
  );
}
