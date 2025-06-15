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
    console.log(
      `Access token updated successfully at ${new Date().toLocaleString()}`
    );
    return body.access_token;
  } catch (error) {
    console.error(
      "Error fetching tokens:",
      error.response?.data || error.messageS
    );
    return null;
    // Consider retrying or logging to handle the error gracefully
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

    await User.updateOne(
      { email: email },
      { $set: updateData },
      { upsert: true }
    );
    console.log(
      `Access token updated successfully at ${new Date().toLocaleString()}`
    );
    return body.access_token;
  } catch (error) {
    console.error(
      "Error fetching tokens:",
      error.response?.data || error.messageS
    );
    return null;
    // Consider retrying or logging to handle the error gracefully
  }
}
module.exports = { getFreshTokens, getUserFreshTokens };
