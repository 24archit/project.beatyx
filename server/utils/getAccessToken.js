const UniToken = require("../models/uniToken");
const User = require("../models/user");
const { getFreshTokens, getUserFreshTokens } = require("./getFreshTokens");
const TOKEN_EXPIRY_TIME = 50 * 60 * 1000; // 50 minutes in milliseconds

// Utility function to validate or refresh tokens
async function getAccessToken() {
  try {
    const Token = await UniToken.findOne(); // Assuming there's only one token document.

    if (!Token) {
      console.error("[TokenError] Token not found in DB.");
      throw new Error(
        "Token not found. Please initialize the token collection."
      );
    }

    const currentTime = new Date();
    const tokenAge = currentTime - new Date(Token.updationTime);

    // Check if token is expired
    if (tokenAge >= TOKEN_EXPIRY_TIME) {
      console.warn("[TokenWarning] Token expired. Attempting to refresh...");

      try {
        const newAccessToken = await getFreshTokens(); // Refresh tokens and update the database

        if (!newAccessToken) {
          console.error(
            "[RefreshError] getFreshTokens() returned null or undefined."
          );
          throw new Error(
            "Failed to refresh the token. Returned value was empty."
          );
        }

        return newAccessToken;
      } catch (refreshError) {
        console.error(
          "[RefreshError] Failed while refreshing token:",
          refreshError
        );
        throw new Error(
          "Token refresh failed. Please check the refresh logic or API credentials."
        );
      }
    }

    return Token.accessToken;
  } catch (err) {
    console.error("[AccessTokenError]", err.message);
    throw err; // Re-throw for the caller to handle (optional)
  }
}

async function getUserAccessToken(email) {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`[UserNotFound] No user found with email`);
      return { error: true, message: "User not found", spotifyConnect: false };
    }

    const accessToken = user.accessToken;
    if (!accessToken) {
      console.warn(`[NoAccessToken] No access token found for user`);
      return { spotifyConnect: false };
    }

    const currentTime = new Date();
    const tokenAge = currentTime - new Date(user.updationTime);

    if (tokenAge >= TOKEN_EXPIRY_TIME) {
      console.log(`[TokenExpired] Token expired for the user. Refreshing...`);

      const newAccessToken = await getUserFreshTokens(user.refreshToken, email);

      if (!newAccessToken) {
        console.error(`[RefreshError] Refresh token failed for ${email}`);
        return {
          error: true,
          message: "Token refresh failed",
          spotifyConnect: false,
        };
      }

      return { spotifyConnect: true, accessToken: newAccessToken };
    }

    return { spotifyConnect: true, accessToken };
  } catch (error) {
    console.error(`[AccessTokenError] Failed to retrieve token:`, error);
    return {
      error: true,
      message: "Unexpected error retrieving token",
      spotifyConnect: false,
    };
  }
}

module.exports = { getAccessToken, getUserAccessToken };
