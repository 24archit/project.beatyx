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
const { getFreshTokens } = require("./utils/getFreshTokens");
const { connectToDb } = require("./utils/connectToDb");
require("dotenv").config();

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_LINK || "https://project-harmonix.vercel.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
// Enable compression
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

connectToDb();

setInterval(getFreshTokens, 3000000);

app.use("/home", homeRoutes);
app.use("/auth", authRoutes);
app.use("/artist", artistRoutes);
app.use("/player", playerRoutes);
app.use("/search", searchRoutes);
app.use("/playlist", playlistRoutes);

// const axios = require("axios");
// const cheerio = require("cheerio");
// const puppeteer = require('puppeteer');
// // Basic route to check if server is running
// app.get("/", (req, res) => {
//   res.send("Pharmacy Price Comparator API is running!");
// });

// // Scraping route for price comparison
// app.get("/scrape", async (req, res) => {
//   const { query } = req.query; // The medicine name from query parameter
//   if (!query) {
//     return res.status(400).send("Please provide a medicine name.");
//   }

//   try {
//     const results = await scrapeMedicinePrices(query);
//     res.json(results); // Send back the scraped data as JSON
//   } catch (error) {
//     res.status(500).send("Error scraping the website");
//   }
// });

// // Function to scrape the data from pharmacy websites
// const scrapeMedicinePrices = async (medicineName) => {
//   try {
//       // Launch Puppeteer
//       const browser = await puppeteer.launch({ headless: true }); // Set `headless: false` to see the browser
//       const page = await browser.newPage();

//       // Navigate to the URL
//       const url = `https://www.netmeds.com/catalogsearch/result/${medicineName}/all`; // Replace with the actual URL
//       await page.goto(url, { waitUntil: 'networkidle2' });

//       // Wait for the product list to load
//       await page.waitForSelector('.ais-InfiniteHits-list');

//       // Extract the content of the fully rendered page
//       const content = await page.content();

//       // Use Cheerio to parse the rendered HTML
//       const cheerio = require('cheerio');
//       const $ = cheerio.load(content);

//       // Extract data from the product list
//       const products = [];
//       $('.ais-InfiniteHits-item').each((index, element) => {
//           const title = $(element).find('.clsgetname').text().trim();
//           const price = $(element).find('.final-price').text().trim() || $(element).find('#final_price').text().trim();
//           const imageUrl = $(element).find('.product-image-photo').attr('src');
//           const productUrl = "https://www.netmeds.com" + $(element).find('.category_name').attr('href');
//           if (title && price && imageUrl) {
//               products.push({ title, price, imageUrl, productUrl });
//           }
//       });

//       await browser.close();
//       return products; // Return the products array
//   } catch (error) {
//       console.error('Error scraping dynamic content:', error.message);
//       return []; // Return an empty array if there's an error
//   }
// };

app.listen(2424, () => {
  console.log("Server is running on http://localhost:2424");
});
