// server/middlewares/verifyAuth.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure env vars are loaded in this file scope
const secretKey = process.env.JWT_SECRET;
const User = require("../models/user");
const { getUserAccessToken } = require("../utils/getAccessToken");

async function verifyAuth(req, res, next) {
  // 1. Extract token
  const authToken =
    req.headers.authorization?.split(" ")[1] || req.body.authToken;

  // 2. Strict validation: Check for "null", "undefined", or missing
  if (!authToken || authToken === "null" || authToken === "undefined") {
    return res.status(401).json({ message: "Token missing or invalid" });
  }

  try {
    // 3. Verify
    const decoded = jwt.verify(authToken, secretKey);
    
    // 4. Fetch user details (existing logic)
    const user = await User.findOne({ email: decoded.user.email });
    if (!user) {
       return res.status(401).json({ message: "User not found" });
    }

    const response = await getUserAccessToken(user.email);
    decoded.user.spotifyConnect = response.spotifyConnect;
    
    req.user = decoded;
    req.session.accessToken = response.accessToken;

    return next();
  } catch (err) {
    // Log the actual error for debugging
    console.error("Auth Middleware Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyAuth;