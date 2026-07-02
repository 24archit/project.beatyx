require("dotenv").config();

function verifyApiSecret(req, res, next) {
  // Allow Spotify's callback and direct auth URL triggers to bypass this check
  // since browser navigations cannot easily send custom headers
  if (req.path.startsWith("/auth/callback") || req.path.startsWith("/auth/api/connectSpotify")) {
    return next();
  }

  const clientSecret = req.headers["x-api-secret"];
  const serverSecret = process.env.API_SECRET;

  if (!serverSecret) {
    console.error("CRITICAL: API_SECRET is not defined in server environment.");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  if (!clientSecret || clientSecret !== serverSecret) {
    console.warn(`[Security] Unauthorized access attempt to ${req.path} without valid API_SECRET`);
    return res.status(401).json({ message: "Unauthorized Request" });
  }

  next();
}

module.exports = verifyApiSecret;
