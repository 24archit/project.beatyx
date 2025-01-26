const { inject } = require("@vercel/analytics");
inject();
require("dotenv").config();
const express = require("express");
const app = express();
const compression = require("compression");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const artistRoutes = require("./routes/artist");
const playerRoutes = require("./routes/player");
const searchRoutes = require("./routes/search");
const playlistRoutes = require("./routes/playlist");
const cors = require("cors");
const { connectToDb } = require("./utils/connectToDb");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_LINK || "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
// Enable compression
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

connectToDb();

app.use("/home", homeRoutes);
app.use("/auth", authRoutes);
app.use("/artist", artistRoutes);
app.use("/player", playerRoutes);
app.use("/search", searchRoutes);
app.use("/playlist", playlistRoutes);

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// app.get("/gemini", async (req, res) => {
//   const prompt =
//     "Give a list of songs on theme: road trip, just give the list no description";
//   if (!prompt) {
//     return res.status(400).send("Please provide a prompt.");
//   }
//   const result = await model.generateContent(prompt);
//   console.log(result.response.text());
//   console.log(result.res);
//   res.json(result.response.text());
// });

if (process.env.VERCEL !== "true") {
  app.listen(2424, () => {
    console.log("Server is running on http://localhost:2424");
  });
}

module.exports = app;
