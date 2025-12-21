const axios = require("axios");
const qs = require("qs");
const UniToken = require("../models/uniToken"); // Ensure path is correct

async function getFreshTokens() {
  try {
    console.log("[TokenSystem] Fetching Refresh Token from DB...");
    
    // 1. Get the latest token document
    const tokenDoc = await UniToken.findOne().sort({ _id: -1 });

    if (!tokenDoc) {
      console.error("[TokenSystem] ❌ No Refresh Token found in DB! Please run seedToken.js");
      return null;
    }

    // Debug Log (Masked)
    console.log(`[TokenSystem] Using Refresh Token: ${tokenDoc.refreshToken.substring(0, 10)}...`);

    // 2. Exchange with Spotify
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token", // Official Token URL
      data: qs.stringify({
        grant_type: "refresh_token",
        refresh_token: tokenDoc.refreshToken,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, expires_in } = response.data;
    console.log("[TokenSystem] ✅ Spotify Accepted! New Access Token received.");

    // 3. Update the Database
    tokenDoc.accessToken = access_token;
    tokenDoc.expiresIn = expires_in;
    tokenDoc.createdAt = new Date(); // Reset timer
    await tokenDoc.save();

    console.log("[TokenSystem] Database updated with fresh Access Token.");
    return access_token;

  } catch (error) {
    console.error("------------------------------------------------");
    console.error("[TokenSystem] ❌ FAILED to refresh token.");
    if (error.response) {
      console.error("Spotify Response:", error.response.data); // Look for 'invalid_grant' here
    } else {
      console.error("Error:", error.message);
    }
    console.error("------------------------------------------------");
    return null;
  }
}

module.exports = { getFreshTokens };