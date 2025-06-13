const UniToken = require("../models/uniToken");
const {getFreshTokens} =require("./getFreshTokens")
const TOKEN_EXPIRY_TIME = 50 * 60 * 1000; // 50 minutes in milliseconds

// Utility function to validate or refresh tokens
async function getAccessToken() {
  const Token = await UniToken.findOne(); // Assuming there's only one token document.
  if (!Token) {
    throw new Error("Token not found. Please initialize the token collection.");
  }

  const currentTime = new Date();
  const tokenAge = currentTime - new Date(Token.updationTime);

  // Check if token is expired
  if (tokenAge >= TOKEN_EXPIRY_TIME) {
    console.log("Token expired. Generating a fresh token...");
    await getFreshTokens(); // Refresh tokens and update the database
    const updatedToken = await UniToken.findOne(); // Re-fetch the updated token
    if (!updatedToken || !updatedToken.accessToken) {
      throw new Error("Failed to refresh the token. Please check the refresh logic.");
    }
    return updatedToken.accessToken;
  }

  return Token.accessToken;
}


module.exports ={getAccessToken}
