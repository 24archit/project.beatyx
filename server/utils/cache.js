// server/utils/cache.js
const NodeCache = require("node-cache");

// stdTTL: time to live in seconds (3600 = 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

module.exports = cache;