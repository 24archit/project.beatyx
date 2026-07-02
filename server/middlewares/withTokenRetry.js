const { getAccessToken, getUserAccessToken } = require("../utils/getAccessToken");

/**
 * Higher-order middleware that wraps a route handler.
 * If the handler throws a 401 Unauthorized from Spotify,
 * it forcefully refreshes the token and retries the handler once.
 */
const withTokenRetry = (handler) => async (req, res, next) => {
  let responded = false;
  const safeRes = new Proxy(res, {
    get(target, prop) {
      if (prop === "json" || prop === "send" || prop === "status") {
        responded = true;
      }
      return target[prop];
    },
  });

  try {
    // 1. Initial attempt
    await handler(req, safeRes, next);
  } catch (error) {
    if (responded) {
      console.error("[withTokenRetry] Error after response sent:", error.message);
      return; // Do NOT attempt retry or send another response
    }

    // 2. Check if the error is a 401 Unauthorized from Spotify
    const isUnauthorized =
      error.response?.status === 401 ||
      error.status === 401 ||
      (error.message && error.message.includes("401"));

    if (isUnauthorized) {
      console.warn("[withTokenRetry] Caught 401 Unauthorized. Refreshing token and retrying...");

      try {
        let newToken;
        const userEmail = req.user?.user?.email;

        if (userEmail) {
          // Attempt to force refresh the user's personal token
          const userTokenRes = await getUserAccessToken(userEmail, true);

          if (!userTokenRes.error && userTokenRes.accessToken) {
            newToken = userTokenRes.accessToken;
          } else {
            console.warn(
              `[withTokenRetry] User token refresh failed for ${userEmail}. Falling back to UniToken.`
            );
            newToken = await getAccessToken(true); // Fallback to uniToken
          }
        } else {
          // Force refresh the universal token
          newToken = await getAccessToken(true);
        }

        // Assign the newly refreshed token to the session
        req.session.accessToken = newToken;

        // 3. Retry the handler with the new token
        try {
          await handler(req, safeRes, next);
        } catch (retryError) {
          if (responded) {
            console.error("[withTokenRetry] Retry error after response sent:", retryError.message);
            return;
          }
          console.error(
            "[withTokenRetry] Retry failed:",
            retryError.response?.data || retryError.message
          );
          res.status(400).json({ error: "Operation failed after token retry" });
        }
      } catch (refreshError) {
        if (!responded) {
          console.error("[withTokenRetry] Token refresh process failed:", refreshError.message);
          res.status(400).json({ error: "Authentication refresh failed" });
        }
      }
    } else {
      // Pass to Express global error handler instead of swallowing
      const wrappedError = new Error(error.response?.data?.error?.message || error.message);
      wrappedError.statusCode = error.response?.status || 500;
      wrappedError.originalError = error;
      return next(wrappedError);
    }
  }
};

module.exports = withTokenRetry;
