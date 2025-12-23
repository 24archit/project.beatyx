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
const albumRoutes = require("./routes/album");
const userRoutes = require("./routes/user.js");
const trackRoutes = require("./routes/track.js");
const cors = require("cors");
const { connectToDb } = require("./utils/connectToDb");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const session = require("express-session");

// CORS options
const corsOptions = {
  origin: `${process.env.CLIENT_LINK}`,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
// Enable compression
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
if (process.env.VERCEL !== "true") {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 15 * 60 * 1000, secure: false, httpOnly: true },
    })
  );
} else {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      },
    })
  );
}
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

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// app.get("/gemini/music-recommendations", async (req, res) => {
//   const prompt = `
// Generate an object with the following structure:
// {
//   "randomSongs": [list 5 random popular Bollywood songs with artist],
//   "randomAlbumSongs": [list 5 songs each from different Bollywood albums with artist and album name]
// }
// Return only the object, no extra text or explanation.
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     let rawText = result.response.text();
//     console.log("Raw Gemini Output:\n", rawText);

//     // 🧹 Clean Gemini's markdown formatting
//     rawText = rawText.replace(/```json|```/g, "").trim();

//     const musicObject = JSON.parse(rawText);
//     res.json(musicObject);
//   } catch (error) {
//     console.error("Error generating music object:", error);
//     res.status(500).send("Failed to generate music recommendations.");
//   }
// });
// app.post("/gemini/music-analysis", async (req, res) => {
//   const userMusicObject = req.body;

//   if (!userMusicObject) {
//     return res.status(400).send("Music object is required in the request body.");
//   }

//   const prompt = `
// Here is a user's Bollywood music taste:

// ${JSON.stringify(userMusicObject, null, 2)}

// Based on this, recommend:
// {
//   "similarSongs": [5 songs similar in vibe or genre to user's taste],
//   "similarAlbumSongs": [5 songs from albums that match the user's preferred album style]
// }
// Return only a valid JSON object. Do not include any explanation or text outside the object.
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     let responseText = result.response.text();
//     console.log("Raw Gemini Response:\n", responseText);

//     // 🧹 Clean Gemini markdown formatting
//     responseText = responseText.replace(/```json|```/g, "").trim();

//     const analysisObject = JSON.parse(responseText);
//     res.json(analysisObject);
//   } catch (error) {
//     console.error("Error analyzing music taste:", error);
//     res.status(500).send("Failed to analyze music taste.");
//   }
// });

// const TM_API_KEY= process.env.TM_API_KEY;
// const axios = require("axios");

// app.get('/getShows', async (req, res) => {
//   const artist = req.query.artist;
//   if (!artist) {
//     return res.status(400).json({ error: 'Missing required query parameter: artist' });
//   }

//   try {
//     // 1. Lookup the artist’s attractionId
//     const attrResp = await axios.get('https://app.ticketmaster.com/discovery/v2/attractions.json', {
//       params: { apikey: TM_API_KEY, keyword: artist }
//     });
//     const attractions = attrResp.data._embedded?.attractions;
//     if (!attractions || attractions.length === 0) {
//       return res.status(404).json({ error: `No artist found for "${artist}"` });
//     }
//     const attractionId = attractions[0].id;

//     // 2. Fetch upcoming music events for that attractionId
//     const eventsResp = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
//       params: {
//         apikey: TM_API_KEY,
//         attractionId,
//         classificationName: 'music',
//         size: 20,
//         sort: 'date,asc'
//       }
//     });
//     const events = eventsResp.data._embedded?.events || [];

//     // 3. For each event, fetch full details in parallel
//     const detailedShows = await Promise.all(events.map(async evt => {
//       // Basic fields
//       const basic = {
//         name: evt.name,
//         id: evt.id,
//         date: evt.dates.start?.dateTime,
//         venue: evt._embedded?.venues?.[0]?.name,
//         city: evt._embedded?.venues?.[0]?.city?.name,
//         country: evt._embedded?.venues?.[0]?.country?.name,
//         url: evt.url,
//         purchaseUrl: evt.sales?.public?.url
//       };

//       // Fetch full event details
//       try {
//         const detailResp = await axios.get(
//           `https://app.ticketmaster.com/discovery/v2/events/${evt.id}.json`,
//           { params: { apikey: TM_API_KEY } }
//         );
//         const detail = detailResp.data;

//         return {
//           ...basic,
//           info: detail.info || detail.pleaseNote || null,          // any textual notes
//           description: detail.description || null,
//           seatmap: detail.seatmap?.staticUrl || null,
//           priceRanges: detail.priceRanges || [],                   // array of {type,min,max,currency}
//           images: (detail.images || []).map(img => ({
//             url: img.url,
//             ratio: img.ratio,
//             width: img.width,
//             height: img.height
//           }))
//         };
//       } catch (detailErr) {
//         console.warn(`Could not fetch details for event ${evt.id}:`, detailErr.message);
//         // Fallback to basic if detail fetch fails
//         return { ...basic, images: [], info: null, description: null, seatmap: null, priceRanges: [] };
//       }
//     }));

//     // 4. Send combined response
//     res.json({ artist, attractionId, totalShows: detailedShows.length, shows: detailedShows });
//   } catch (err) {
//     console.error('Error fetching shows:', err.message);
//     res.status(500).json({ error: 'Failed to fetch shows. See server logs for details.' });
//   }
// });

if (process.env.VERCEL !== "true") {
  app.listen(2424, () => {
    console.log("Server is running on http://localhost:2424");
  });
}

module.exports = app;
