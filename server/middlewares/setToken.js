const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getUserAccessToken, getAccessToken } = require("../utils/getAccessToken");

const secretKey = process.env.JWT_SECRET;

async function setToken(req, res, next) {
  try {
    const authToken = req.headers.authorization?.split(" ")[1] || req.body.authToken;

    if (!authToken || authToken === "null" || authToken === "undefined") {
      req.session.accessToken = await getAccessToken();
      return next();
    }
    const decoded = jwt.verify(authToken, secretKey);
    const userEmail = decoded?.user?.email;

    if (!userEmail) throw new Error("Invalid token");

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      req.session.accessToken = await getAccessToken();
      return next();
    }

    const spotifyResponse = await getUserAccessToken(user.email);

    decoded.user.spotifyConnect = spotifyResponse.spotifyConnect;
    req.user = decoded;

    req.session.accessToken = spotifyResponse.spotifyConnect
      ? spotifyResponse.accessToken
      : await getAccessToken();

    return next();
  } catch (err) {
    if (err.message !== "jwt malformed") {
      console.error("Token processing error:", err.message);
    }

    req.session.accessToken = await getAccessToken();
    return next();
  }
}

module.exports = setToken;
