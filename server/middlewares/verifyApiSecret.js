require("dotenv").config();

const BYPASS_PATHS = new Set(["/auth/callback", "/auth/api/connectspotify"]);
function verifyApiSecret(req, res, next) {
  if (req.method === "OPTIONS") return next();

  // Exact match only — no prefix games
  const normalizedPath = req.path.split("?")[0].toLowerCase();
  if (BYPASS_PATHS.has(normalizedPath)) return next();

  const clientSecret = req.headers["x-api-secret"];
  const serverSecret = process.env.API_SECRET;

  if (!serverSecret) {
    console.error("CRITICAL: API_SECRET is not defined.");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  // Use timing-safe comparison to prevent timing attacks
  const crypto = require("crypto");
  const isValid =
    clientSecret &&
    clientSecret.length === serverSecret.length &&
    crypto.timingSafeEqual(Buffer.from(clientSecret), Buffer.from(serverSecret));

  if (!isValid) {
    console.warn(`[Security] Unauthorized access attempt to ${req.path}`);
    return res.status(401).json({ message: "Unauthorized Request" });
  }

  next();
}

module.exports = verifyApiSecret;
