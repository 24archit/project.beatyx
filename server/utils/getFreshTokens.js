require("dotenv").config();
const axios = require("axios");
const UniToken = require("../models/uniToken");
const User = require("../models/user");

async function getFreshTokens() {
  const refreshToken = process.env.REFRESH_TOKEN;

  const encodedCredentials = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );
    const body = response.data;
    await UniToken.updateOne(
      {}, // Assuming there's only one document
      { accessToken: body.access_token, updationTime: new Date() },
      { upsert: true }
    );

    return body.access_token;
  } catch (error) {
    console.error("Error fetching UniTokens:", error.response?.data || error.message);
    return null;
  }
}
async function getUserFreshTokens(refreshToken, email) {
  const encodedCredentials = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );
    const body = response.data;
    const updateData = {
      accessToken: body.access_token,
      updationTime: new Date(),
    };

    if ("refresh_token" in body) {
      updateData.refreshToken = body.refresh_token;
    }

    await User.updateOne({ email: email }, { $set: updateData }, { upsert: true });

    return body.access_token;
  } catch (error) {
    console.error(
      `Error fetching user tokens for ${email}:`,
      error.response?.data || error.message
    );

    // If the refresh token is invalid or revoked by the user, clear it from DB to stop endless failing loops
    if (error.response?.data?.error === "invalid_grant") {
      console.warn(
        `[UserRevoked] Refresh token for ${email} is invalid/revoked. Disconnecting Spotify.`
      );
      await User.updateOne(
        { email: email },
        { $unset: { accessToken: "", refreshToken: "", updationTime: "" } }
      );
    }

    return null;
  }
}
module.exports = { getFreshTokens, getUserFreshTokens };
