
const {getAccessToken} = require("./getAccessToken")
const axios = require("axios");

const TM_API_KEY = process.env.TM_API_KEY;

async function makeApiRequest(url, method = "GET", headers = {}, retries = 4, delay = 800) {
  try {
    const response = await axios({
      url,
      method,
      headers,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status || error.message;
    console.error(`Error with API request: ${url}. Status: ${status}`);

    if (status === 401) {
      console.log("Refreshing access tokens...");
      await getFreshTokens();
    }

    if (retries > 0) {
      console.log(`Retrying API request... (${4 - retries + 1}/4)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return makeApiRequest(url, method, headers, retries - 1, delay);
    } else {
      console.error("Max retries reached. Could not complete the API request.");
      throw error;
    }
  }
}
async function getAttractionId(artist) {
  const attrResp = await axios.get(
    "https://app.ticketmaster.com/discovery/v2/attractions.json",
    {
      params: { apikey: TM_API_KEY, keyword: artist },
    }
  );
  const attractions = attrResp.data._embedded?.attractions;
  if (!attractions || attractions.length === 0) {
    return null;
  }
  return attractions[0].id;
}

async function getDetailedShows(attractionId) {
  const eventsResp = await axios.get(
    "https://app.ticketmaster.com/discovery/v2/events.json",
    {
      params: {
        apikey: TM_API_KEY,
        attractionId,
        classificationName: "music",
        size: 20,
        sort: "date,asc",
      },
    }
  );

  const events = eventsResp.data._embedded?.events || [];

  const detailedShows = await Promise.all(
    events.map(async (evt) => {
      const basic = {
        name: evt.name,
        id: evt.id,
        date: evt.dates.start?.dateTime,
        venue: evt._embedded?.venues?.[0]?.name,
        city: evt._embedded?.venues?.[0]?.city?.name,
        country: evt._embedded?.venues?.[0]?.country?.name,
        url: evt.url,
        purchaseUrl: evt.sales?.public?.url,
      };

      try {
        const detailResp = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/events/${evt.id}.json`,
          { params: { apikey: TM_API_KEY } }
        );
        const detail = detailResp.data;

        return {
          ...basic,
          info: detail.info || detail.pleaseNote || null,
          description: detail.description || null,
          seatmap: detail.seatmap?.staticUrl || null,
          priceRanges: detail.priceRanges || [],
          images: (detail.images || []).map((img) => ({
            url: img.url,
            ratio: img.ratio,
            width: img.width,
            height: img.height,
          })),
        };
      } catch (detailErr) {
        console.warn(`Could not fetch details for event ${evt.id}:`, detailErr.message);
        return {
          ...basic,
          images: [],
          info: null,
          description: null,
          seatmap: null,
          priceRanges: [],
        };
      }
    })
  );

  return detailedShows;
}

async function getArtistShows(artistId, rightAccessToken, artistName = "") {
  if (!TM_API_KEY) {
    throw new Error("Ticketmaster API key (TM_API_KEY) is not set.");
  }

  try {
    let artist = artistName.trim();
    if (!artist) {
      const artistDataUrl = `https://api.spotify.com/v1/artists/${artistId}`;
      const accessToken = rightAccessToken;
      const artistData = await makeApiRequest(
        artistDataUrl,
        "GET",
        { Authorization: `Bearer ${accessToken}` },
        4,
        800
      );
      artist = artistData.name.trim();
    }

    const attractionId = await getAttractionId(artist);
    if(!attractionId){
        return {};
    }
    const detailedShows = await getDetailedShows(attractionId);

    return {
      artist,
      attractionId,
      totalShows: detailedShows.length,
      shows: detailedShows,
    };
  } catch (err) {
    console.error("Error fetching shows:", err.message);
    throw new Error(`Error fetching shows for artist ${artistId}: ${err.message}`);
  }
}
module.exports={getArtistShows};