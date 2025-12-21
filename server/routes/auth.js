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
        .status(409)
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
      return res.status(500).send("Missing environment variables (REDIRECT_URI or CLIENT_ID)");
    }

    // FIX: Use OFFICAL Spotify URL (https)
    // This ensures no 'Insecure Redirect URI' errors
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
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/callback", async (req, res) => {
  // Check for error query parameter from Spotify
  if (req.query.error) {
    // ... [Keep your existing HTML Error Page logic] ...
    return res.send(`<h1>Authorization Failed</h1><a href="${process.env.CLIENT_LINK}">Back</a>`);
  }

  const { code, state } = req.query;
  const email = req.session.email;

  // Verify State to prevent CSRF
  if (state === null || state !== req.session.oauthState) {
    return res.status(403).send("State mismatch. Possible CSRF attack.");
  }

  try {
    // FIX: Use OFFICIAL Spotify Token Endpoint
    // We send client_id and client_secret in the body
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
    
    // Fetch User Info using the new token
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

    if (!email) return res.status(400).send("No email found in session. Please retry logging in.");

    const result = await User.updateOne({ email }, profile);
    
    if (result.matchedCount === 0) {
      return res.status(404).send("User not found.");
    }

    // Clear session details
    delete req.session.email;
    delete req.session.oauthState;

    // Redirect back to Frontend
    res.redirect(process.env.CLIENT_LINK);
    
  } catch (error) {
    console.error("Error during Spotify callback:", error.response ? error.response.data : error.message);
    res.status(500).send("Error during Spotify authentication.");
  }
});

module.exports = router;
