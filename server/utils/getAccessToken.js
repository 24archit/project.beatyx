const UniToken = require("../models/uniToken");
const User = require("../models/user");
const { getFreshTokens, getUserFreshTokens } = require("./getFreshTokens");
const crypto = require("crypto");
const hashEmail = (email) => crypto.createHash("sha256").update(email).digest("hex").slice(0, 12);
const TOKEN_EXPIRY_TIME = 45 * 60 * 1000; // 45 minutes (Spotify tokens last 60min — use 45 to be safe)
const CLOCK_SKEW_BUFFER = 30 * 1000; // 30 second buffer

let refreshPromise = null; // In-flight deduplication
async function getAccessToken(forceRefresh = false) {
  const Token = await UniToken.findOne();
  if (!Token) {
    console.error("[TokenError] Token not found in DB.");
    throw new Error("Token not found. Please initialize the token collection.");
  }
  const tokenAge = Date.now() - new Date(Token.updationTime).getTime();
  if (tokenAge < TOKEN_EXPIRY_TIME - CLOCK_SKEW_BUFFER && !forceRefresh) {
    return Token.accessToken; // Fast path — no refresh needed
  }
  // If a refresh is already in-flight, wait for it instead of stampeding
  if (refreshPromise) {
    return refreshPromise;
  }
  // This process is now the single refresher
  refreshPromise = getFreshTokens()
    .then((newAccessToken) => {
      if (!newAccessToken) {
        throw new Error("Failed to refresh the token. Returned value was empty.");
      }
      return newAccessToken;
    })
    .catch((err) => {
      throw new Error("Token refresh failed: " + err.message);
    })
    .finally(() => {
      refreshPromise = null; // Release lock when done
    });
  return refreshPromise;
}

const userRefreshPromises = new Map(); // In-flight deduplication per user

async function getUserAccessToken(email, forceRefresh = false) {
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

    const tokenAge = Date.now() - new Date(user.updationTime).getTime();

    if (tokenAge < TOKEN_EXPIRY_TIME - CLOCK_SKEW_BUFFER && !forceRefresh) {
      return { spotifyConnect: true, accessToken };
    }

    if (userRefreshPromises.has(email)) {
      return userRefreshPromises.get(email);
    }

    const refreshPromise = getUserFreshTokens(user.refreshToken, email)
      .then((newAccessToken) => {
        if (!newAccessToken) {
          console.error(`[RefreshError] Refresh token failed for [${hashEmail(email)}]`);
          return {
            error: true,
            message: "Token refresh failed",
            spotifyConnect: false,
          };
        }
        return { spotifyConnect: true, accessToken: newAccessToken };
      })
      .catch((err) => {
        console.error(`[AccessTokenError] Failed to retrieve token:`, err);
        return {
          error: true,
          message: "Unexpected error retrieving token",
          spotifyConnect: false,
        };
      })
      .finally(() => {
        userRefreshPromises.delete(email);
      });

    userRefreshPromises.set(email, refreshPromise);
    return refreshPromise;
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
