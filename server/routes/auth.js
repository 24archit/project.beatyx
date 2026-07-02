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
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 auth attempts per IP per window
  message: "Too many authentication attempts. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Handles user signup.
 * @route POST /auth/signup
 */
router.post("/signup", authLimiter, async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ success: false, error: "User already exists with that email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      displayName,
      email,
      password: hashedPassword,
    });

    const payload = {
      user: {
        id: user._id,
        email: email,
      },
    };
    const authToken = JWT.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
      issuer: "beatyx-api",
      audience: "beatyx-client",
    });

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
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

/**
 * Handles user login.
 * @route POST /auth/login
 */
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    // 3) On success, issue JWT
    const payload = {
      user: {
        id: user._id,
        email: email,
      },
    };
    const authToken = JWT.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
      issuer: "beatyx-api",
      audience: "beatyx-client",
    });

    return res.status(200).json({ success: true, authToken });
  } catch (error) {
    console.error("Login route error:", error.message);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

/**
 * Verifies the JWT token and returns auth status.
 * @route GET /auth/verifyauth
 */
router.get("/verifyauth", verifyAuth, async (req, res) => {
  res.status(200).json({ isVerified: true, isSpotifyConnect: req.user.user.spotifyConnect });
});
const ALLOWED_REDIRECTS = [
  process.env.CLIENT_LINK,
  "http://localhost:5173",
  "capacitor://localhost",
];
function isSafeRedirect(url) {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECTS.some((allowed) => {
      const allowedParsed = new URL(allowed);
      return parsed.origin === allowedParsed.origin;
    });
  } catch {
    return false;
  }
}

/**
 * Initiates the Spotify connection process.
 * @route POST /api/connectSpotify
 */
router.all("/api/connectSpotify", verifyAuth, (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.email = req.user.user.email;
    req.session.oauthState = state;
    if (req.query.appRedirect && isSafeRedirect(req.query.appRedirect)) {
      req.session.appRedirect = req.query.appRedirect;
    }

    const scope = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
      "playlist-modify-public",
      "playlist-modify-private",
      "playlist-read-private",
      "user-library-read",
      "user-follow-read",
    ].join(" ");

    const redirect_uri = process.env.REDIRECT_URI;
    const client_id = process.env.CLIENT_ID;

    if (!redirect_uri || !client_id) {
      return res.status(500).send("Missing environment variables (REDIRECT_URI or CLIENT_ID)");
    }

    const authURL =
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        show_dialog: "true",
      });

    res.redirect(authURL);
  } catch (error) {
    console.error("Spotify authURL Generation error:", error.message);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

/**
 * Callback handler for Spotify OAuth.
 * @route GET /auth/callback
 */
router.get("/callback", async (req, res) => {
  if (req.query.error) {
    return res.send(`<h1>Authorization Failed</h1><a href="${process.env.CLIENT_LINK}">Back</a>`);
  }

  const { code, state } = req.query;
  const email = req.session.email;

  if (state === null || state !== req.session.oauthState) {
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
      spotify_profilePic: spotifyUserData.images.length > 0 ? spotifyUserData.images[0].url : "",
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

    const redirectUrl =
      req.session.appRedirect && isSafeRedirect(req.session.appRedirect)
        ? req.session.appRedirect
        : process.env.CLIENT_LINK;
    delete req.session.email;
    delete req.session.oauthState;
    delete req.session.appRedirect;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Error during Spotify callback:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error during Spotify authentication.");
  }
});

module.exports = router;
