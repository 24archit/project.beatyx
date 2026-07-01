import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLoggedIn } from "@/features/auth/authService";
import Logo from "@/components/Logo";
import { AnimatedWave } from "@/features/player/AnimatedWave";
import "./AuthPage.css";
import "@/features/player/Player.css"; // Ensure AnimatedWave styles are loaded

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill up all the details to login");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = { email, password };
      const response = await getLoggedIn(formData);

      if (response.status === 401 || response.status === 402) {
        setErrorMsg(response.data.error);
        setIsLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Login failed", error);
      setErrorMsg("Login error, please try again.");
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
            Welcome back to Beatyx. Discover new music, create playlists, and share your vibe.
          </p>
        </div>
        
        <div className="auth-form-side">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to your account</p>
          
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-input-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
