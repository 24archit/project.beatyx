const { inject } = require("@vercel/analytics");
inject();
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.set("trust proxy", 1);
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const artistRoutes = require("./routes/artist");
const playerRoutes = require("./routes/player");
const searchRoutes = require("./routes/search");
const playlistRoutes = require("./routes/playlist");
const albumRoutes = require("./routes/album");
const userRoutes = require("./routes/user.js");
const trackRoutes = require("./routes/track.js");
const customPlaylistRoutes = require("./routes/customPlaylist.js");
const cors = require("cors");
const { connectToDb } = require("./utils/connectToDb");
const verifyApiSecret = require("./middlewares/verifyApiSecret");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const corsOptions = {
  origin: [
    process.env.CLIENT_LINK ? process.env.CLIENT_LINK.replace(/\/$/, "") : "",
    "https://beatyx.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "capacitor://localhost",
    "http://10.112.92.110:5173",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"],
};
app.use(cors(corsOptions));
morgan.token("safe-auth", (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return "Bearer [REDACTED]";
  }
  return auth || "-";
});
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" auth=:safe-auth',
    { skip: (req) => req.path === "/health" } // Skip health check noise
  )
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://va.vercel-scripts.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://i.scdn.co", "https://*.scdn.co"],
        connectSrc: ["'self'", "https://api.spotify.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // 2000 requests per 15 minutes (increased from 100 to prevent normal usage blocks)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use(compression());
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

// Security middlewares
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xss()); // Prevent Cross Site Scripting (XSS)
app.use(hpp()); // Prevent HTTP Parameter Pollution

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 15 * 60,
    }),
    cookie: {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: process.env.VERCEL === "true",
      sameSite: "lax", // Required for Spotify OAuth cross-site redirect
    },
  })
);
connectToDb();

// Health check endpoint for uptime monitoring and load balancers
// Unauthenticated so external services can ping it
app.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1; // 1 = connected
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    db: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
    uptime: process.uptime(),
  });
});

app.use(verifyApiSecret);

app.use("/home", homeRoutes);
app.use("/auth", authRoutes);
app.use("/artist", artistRoutes);
app.use("/player", playerRoutes);
app.use("/search", searchRoutes);
app.use("/playlist", playlistRoutes);
app.use("/album", albumRoutes);
app.use("/user", userRoutes);
app.use("/track", trackRoutes);
app.use("/custom-playlist", customPlaylistRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  // Log the full error server-side (with request context for tracing)
  console.error({
    requestId: req.headers["x-request-id"] || "unknown",
    method: req.method,
    path: req.path,
    statusCode,
    error: err.message,
    stack: err.stack,
  });
  // Return ONLY a sanitized message to the client — NEVER the stack trace
  const clientMessage =
    statusCode >= 500
      ? "An internal server error occurred. Our team has been notified."
      : err.message;
  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    // No stack property at all
  });
});
if (process.env.VERCEL !== "true") {
  app.listen(2424, () => {
    // eslint-disable-next-line no-console
    console.log("Server is running on http://localhost:2424");
  });
}

module.exports = app;
