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
const cors = require("cors");
const { connectToDb } = require("./utils/connectToDb");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const session = require("express-session");

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_LINK,
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
      cookie: { secure: false, httpOnly: true },
    })
  );
} else {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true, httpOnly: true },
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
const TM_API_KEY= process.env.TM_API_KEY;
const axios = require("axios");

app.get('/getShows', async (req, res) => {
  const artist = req.query.artist;
  if (!artist) {
    return res.status(400).json({ error: 'Missing required query parameter: artist' });
  }

  try {
    // 1. Lookup the artist’s attractionId
    const attrResp = await axios.get('https://app.ticketmaster.com/discovery/v2/attractions.json', {
      params: { apikey: TM_API_KEY, keyword: artist }
    });
    const attractions = attrResp.data._embedded?.attractions;
    if (!attractions || attractions.length === 0) {
      return res.status(404).json({ error: `No artist found for "${artist}"` });
    }
    const attractionId = attractions[0].id;

    // 2. Fetch upcoming music events for that attractionId
    const eventsResp = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: TM_API_KEY,
        attractionId,
        classificationName: 'music',
        size: 20,
        sort: 'date,asc'
      }
    });
    const events = eventsResp.data._embedded?.events || [];

    // 3. For each event, fetch full details in parallel
    const detailedShows = await Promise.all(events.map(async evt => {
      // Basic fields
      const basic = {
        name: evt.name,
        id: evt.id,
        date: evt.dates.start?.dateTime,
        venue: evt._embedded?.venues?.[0]?.name,
        city: evt._embedded?.venues?.[0]?.city?.name,
        country: evt._embedded?.venues?.[0]?.country?.name,
        url: evt.url,
        purchaseUrl: evt.sales?.public?.url
      };

      // Fetch full event details
      try {
        const detailResp = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/events/${evt.id}.json`,
          { params: { apikey: TM_API_KEY } }
        );
        const detail = detailResp.data;

        return {
          ...basic,
          info: detail.info || detail.pleaseNote || null,          // any textual notes
          description: detail.description || null,
          seatmap: detail.seatmap?.staticUrl || null,
          priceRanges: detail.priceRanges || [],                   // array of {type,min,max,currency}
          images: (detail.images || []).map(img => ({
            url: img.url,
            ratio: img.ratio,
            width: img.width,
            height: img.height
          }))
        };
      } catch (detailErr) {
        console.warn(`Could not fetch details for event ${evt.id}:`, detailErr.message);
        // Fallback to basic if detail fetch fails
        return { ...basic, images: [], info: null, description: null, seatmap: null, priceRanges: [] };
      }
    }));

    // 4. Send combined response
    res.json({ artist, attractionId, totalShows: detailedShows.length, shows: detailedShows });
  } catch (err) {
    console.error('Error fetching shows:', err.message);
    res.status(500).json({ error: 'Failed to fetch shows. See server logs for details.' });
  }
});
if (process.env.VERCEL !== "true") {
  app.listen(2424, () => {
    console.log("Server is running on http://localhost:2424");
  });
}

module.exports = app;
