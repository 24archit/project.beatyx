require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const axios = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");
const { getCurrentUserInfo } = require("../utils/spotifyApis");
const verifyAuth = require("../middlewares/verifyAuth");

// Load the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
// Signup route
router.post("/signup", async (req, res) => {
  const { displayName, email, password, recaptchaToken } = req.body;

  // 1) Verify reCAPTCHA v3 token
  if (!recaptchaToken) {
    return res
      .status(400)
      .json({ success: false, error: "reCAPTCHA token is missing." });
  }
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", recaptchaToken);

    const verificationRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );

    const { success, score, action } = verificationRes.data;
    // Optionally verify action === 'signup'
    if (!success || score < 0.5) {
      return res
        .status(401)
        .json({ success: false, error: "reCAPTCHA failed. Are you a bot?" });
    }
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    return res
      .status(500)
      .json({ success: false, error: "reCAPTCHA verification error." });
  }

  // 2) Proceed with your existing signup logic
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists with that email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    user = await User.create({
      displayName,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        email: email,
      },
    };
    const authToken = JWT.sign(payload, process.env.JWT_SECRET);

    // Return success response with token
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
      authToken,
      spotifyConnect: false,
    });
  } catch (error) {
    console.error("Signup route error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  if (!recaptchaToken) {
    return res
      .status(400)
      .json({ success: false, error: "reCAPTCHA token is missing." });
  }
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", recaptchaToken);

    const verificationRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );

    const { success, score, action } = verificationRes.data;
    // Optionally verify action === 'signup'
    if (!success || score < 0.5) {
      return res
        .status(401)
        .json({ success: false, error: "reCAPTCHA failed. Are you a bot?" });
    }
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    return res
      .status(500)
      .json({ success: false, error: "reCAPTCHA verification error." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error:
          "Oops! You have not registered with this email. Please register.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(402)
        .json({ success: false, error: "Invalid password" });
    }
    // 3) On success, issue JWT
    const payload = {
      user: {
        id: user._id,
        email: email,
      },
    };
    const authToken = JWT.sign(payload, process.env.JWT_SECRET);

    return res.status(200).json({ success: true, authToken });
  } catch (error) {
    console.error("Login route error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});
router.get("/verifyauth", verifyAuth, async (req, res) => {
  res.status(200).json({ isVerified: true, isSpotifyConnect: req.user.user.spotifyConnect });
});
router.post("/api/connectSpotify", verifyAuth, (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.email = req.user.user.email;
    req.session.oauthState = state;
    const scope = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
      "playlist-modify-public",
      "playlist-modify-private",
    ].join(" ");

    const redirect_uri = process.env.REDIRECT_URI;
    const client_id = process.env.CLIENT_ID;
    if (!redirect_uri || !client_id) {
      return res.status(500).send("Missing environment variables");
    }

    const authURL =
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      });

    res.redirect(authURL);
  } catch (error) {
    console.error("Spotify authURL Generation error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/callback", async (req, res) => {
  if (req.query.error) {
    return res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Authorization Failed - Beatyx</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
    }

    /* Animated background particles */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(0, 170, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 170, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(0, 170, 255, 0.08) 0%, transparent 50%);
      animation: float 20s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }



    /* Main content */
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .error-container {
      text-align: center;
      max-width: 500px;
      width: 100%;
      padding: 3rem 2rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(0, 170, 255, 0.2);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-icon {
      font-size: 4rem;
      color: #ff6b6b;
      margin-bottom: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.3));
    }

    .error-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #00aaff;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
    }

    .error-message {
      font-size: 1.1rem;
      color: #b8c5d1;
      margin-bottom: 2.5rem;
      line-height: 1.6;
      opacity: 0.9;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #000;
      background: linear-gradient(135deg, #00aaff 0%, #0088cc 100%);
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(0, 170, 255, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .back-button:hover {
      background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(0, 170, 255, 0.4);
    }

    .back-button:active {
      transform: translateY(0);
    }

    /* Footer */
    .footer {
      padding: 2rem;
      text-align: center;
      backdrop-filter: blur(10px);
      background: rgba(0, 170, 255, 0.03);
      border-top: 1px solid rgba(0, 170, 255, 0.1);
    }

    .footer-content {
      color: #6b7280;
      font-size: 0.9rem;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .error-container {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .error-title {
        font-size: 2rem;
      }

      .error-message {
        font-size: 1rem;
      }

      .back-button {
        padding: 0.8rem 1.5rem;
        font-size: 0.9rem;
      }

      .footer {
        padding: 1.5rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .error-icon {
        font-size: 3rem;
      }

      .error-title {
        font-size: 1.8rem;
      }

      .error-container {
        padding: 1.5rem 1rem;
      }
    }
  </style>
</head>
<body>
  <!-- Main Content -->
  <main class="main-content">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h1 class="error-title">Authorization Failed</h1>
      <p class="error-message">
        Something went wrong while connecting your account. Please check your credentials and try again.
      </p>
      <a href=${process.env.CLIENT_LINK} class="back-button">
        ← Back to Beatyx
      </a>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p>&copy; 2025 Beatyx. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
    `);
  }
  const { code, state } = req.query;
  const email = req.session.email;
  if (state !== req.session.oauthState) {
    return res.status(403).send("State mismatch. Possible CSRF attack.");
  }
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    const spotifyUserData = await getCurrentUserInfo(access_token);
    const profile = {
      country: spotifyUserData.country,
      spotify_url: spotifyUserData.external_urls.spotify,
      spotifyId: spotifyUserData.id,
      spotify_profilePic:
        spotifyUserData.images.length > 0 ? spotifyUserData.images[0].url : "",
      spotify_accType: spotifyUserData.product,
      followers: spotifyUserData.followers.total,
      accessToken: access_token,
      refreshToken: refresh_token,
      updationTime: new Date(),
    };
    if (!email) return res.status(400).send("No email found in session.");

    const result = await User.updateOne({ email }, profile);
    if (result.matchedCount === 0) {
      return res.status(404).send("User not found.");
    }
    delete req.session.email;
    delete req.session.oauthState;
    res.redirect(process.env.CLIENT_LINK);
  } catch (error) {
    console.error("Error during Spotify callback:", error);
    res.status(500).send("Error during Spotify authentication.");
  }
});

module.exports = router;
