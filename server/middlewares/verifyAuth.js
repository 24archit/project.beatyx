// server/middlewares/verifyAuth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
const User = require("../models/user");
const { getUserAccessToken, getAccessToken } = require("../utils/getAccessToken");

async function verifyAuth(req, res, next) {
  let authToken;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    authToken = authHeader.split(" ")[1];
  } else if (req.body && req.body.authToken) {
    authToken = req.body.authToken;
  } else if (req.query && req.query.authToken) {
    authToken = req.query.authToken;
  }

  if (!authToken || authToken === "null" || authToken === "undefined") {
    return res.status(401).json({ message: "Authorization header missing or malformed" });
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);

    const user = await User.findOne({ email: decoded.user.email }).select(
      "email _id accessToken refreshToken updationTime"
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const response = await getUserAccessToken(user.email);
    decoded.user.spotifyConnect = response.spotifyConnect;

    req.user = decoded;
    req.session.accessToken = response.spotifyConnect
      ? response.accessToken
      : await getAccessToken();

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyAuth;
