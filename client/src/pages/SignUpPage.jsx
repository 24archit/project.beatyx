import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSignUp } from "@/features/auth/authService";
import Logo from "@/components/Logo";
import { AnimatedWave } from "@/features/player/AnimatedWave";
import "./AuthPage.css";
import "@/features/player/Player.css"; // Ensure AnimatedWave styles are loaded

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMsg("Please fill up all the details to join");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await getSignUp(formData);

      if (result.success) {
        window.location.href = "/";
      } else {
        if (result.status === 409) setErrorMsg("User already exists! Please Log In.");
        else if (result.status === 400) setErrorMsg("Invalid details provided.");
        else if (result.status === 500) setErrorMsg("Server error. Please try again later.");
        else setErrorMsg("Signup failed. Please check your connection.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup error", error);
      setErrorMsg("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-layout-wrapper">
        <div className="auth-branding-side">
          <div style={{ height: '30px', margin: '0 0 20px 0', display: 'flex', justifyContent: 'center' }}>
             <AnimatedWave playing={true} />
          </div>
          <Logo />
          <p className="auth-branding-text">
            Join Beatyx today. Experience seamless music streaming and connect with your favorite artists.
          </p>
        </div>

        <div className="auth-form-side">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Sign up to start listening</p>
          
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form onSubmit={handleSignUp} className="auth-form">
            <div className="auth-input-group">
              <label>Display Name</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName} 
                onChange={handleInputChange} 
                placeholder="What should we call you?"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder="Create a password"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
                placeholder="Confirm your password"
                required 
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
