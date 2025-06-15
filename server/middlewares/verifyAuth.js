// Jis route main auth compulsory hai
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const User = require("../models/user");
const { getUserAccessToken } = require("../utils/getAccessToken");
async function verifyAuth(req, res, next) {
  const authToken =
    req.headers.authorization?.split(" ")[1] || req.body.authToken;
  if (!authToken) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);
    const user = await User.findOne({ email: decoded.user.email });
    const response = await getUserAccessToken(user.email);
    decoded.user.spotifyConnect = response.spotifyConnect;
    req.user = decoded;
    req.session.accessToken = response.accessToken;

    return next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyAuth;
