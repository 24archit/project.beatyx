const UniToken = require("../models/uniToken");
const { getFreshTokens } = require("./getFreshTokens");

async function getAccessToken() {
  try {
    // 1. Try to find an existing token
    const tokenDoc = await UniToken.findOne().sort({ _id: -1 });

    let isValid = false;

    // 2. Validate the token document
    if (tokenDoc && tokenDoc.accessToken && tokenDoc.createdAt && tokenDoc.expiresIn) {
      const now = new Date();
      // Calculate expiration time safely
      const expirationTime = new Date(tokenDoc.createdAt.getTime() + tokenDoc.expiresIn * 1000);
      const bufferTime = new Date(expirationTime.getTime() - 60000); // 1 minute buffer

      if (now < bufferTime) {
        isValid = true;
      }
    } else {
        // Log specifically why it is invalid so you can debug
        console.log("[TokenSystem] Token found but incomplete (missing createdAt or expiresIn). Forcing refresh.");
    }

    // 3. Return valid token OR Refresh
    if (isValid) {
      return tokenDoc.accessToken;
    }

    // 4. Force Refresh
    console.log("[TokenSystem] Access Token expired, missing, or invalid. Refreshing now...");
    const newToken = await getFreshTokens();

    if (!newToken) {
      // Don't crash the server, just log error and return null (middleware will handle 401)
      console.error("[TokenSystem] Critical: getFreshTokens() failed to retrieve a token.");
      return null; 
    }

    return newToken;

  } catch (error) {
    console.error("[TokenSystem] Error in getAccessToken:", error.message);
    // Return null instead of throwing to prevent app crash loop
    return null; 
  }
}

module.exports = { getAccessToken };