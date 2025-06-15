const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getUserAccessToken, getAccessToken } = require("../utils/getAccessToken");

const secretKey = process.env.JWT_SECRET;

async function setToken(req, res, next) {
  try {
    const authToken =
      req.headers.authorization?.split(" ")[1] || req.body.authToken;

    if (!authToken) {
      // No user JWT, use generic 24archit token
      req.session.accessToken = await getAccessToken();
      return next();
    }

    // Decode and verify JWT
    const decoded = jwt.verify(authToken, secretKey);
    const userEmail = decoded?.user?.email;

    if (!userEmail) throw new Error("Invalid token");

    // Fetch user and user's Spotify access token
    const user = await User.findOne({ email: userEmail });
    const spotifyResponse = await getUserAccessToken(user.email);

    // Add Spotify connection info to decoded user
    decoded.user.spotifyConnect = spotifyResponse.spotifyConnect;
    req.user = decoded;

    // Set appropriate token in session
    req.session.accessToken = spotifyResponse.spotifyConnect
      ? spotifyResponse.accessToken
      : await getAccessToken();

    return next();
  } catch (err) {
    console.error("Token processing error:", err.message);

    // Fallback: Use default token if JWT is invalid or any error occurs
    req.session.accessToken = await getAccessToken();
    return next();
  }
}

module.exports = setToken;
