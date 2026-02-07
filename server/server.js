const { inject } = require("@vercel/analytics");
inject();
require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
const cors = require("cors");
const { connectToDb } = require("./utils/connectToDb");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const corsOptions = {
  origin: `${process.env.CLIENT_LINK}`,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
app.use(morgan("combined"));
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

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
    },
  })
);
connectToDb();

app.use("/home", homeRoutes);
app.use("/auth", authRoutes);
app.use("/artist", artistRoutes);
app.use("/player", playerRoutes);
app.use("/search", searchRoutes);
app.use("/playlist", playlistRoutes);
app.use("/album", albumRoutes);
app.use("/user", userRoutes);
app.use("/track", trackRoutes);

app.use((err, req, res) => {
  console.error("❌ Global Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.VERCEL === "true" ? null : err.stack,
  });
});
if (process.env.VERCEL !== "true") {
  app.listen(2424, () => {
    // eslint-disable-next-line no-console
    console.log("Server is running on http://localhost:2424");
  });
}

module.exports = app;
