require("dotenv").config();
const axios = require("axios");
const UniToken = require("../models/uniToken");

async function getFreshTokens(){
    
  const refreshToken= process.env.REFRESH_TOKEN;

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
      { accessToken: body.access_token, updationTime: new Date()}, { upsert: true }
    );
    console.log(`Access token updated successfully at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error(
      "Error fetching tokens:",
      error.response?.data || error.messageS
    );
    // Consider retrying or logging to handle the error gracefully
  }
}

module.exports ={getFreshTokens};