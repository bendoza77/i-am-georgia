const catchAsync = require("../utils/catchAsync.util");
const AppError = require("../utils/AppError.util");
const getHotelSheets = require("../services/googleSheets.service");
const parseHotels = require("../utils/parseHotels.util");

// --- Simple in-memory cache ---
// Reading 140 tabs from Google is slow, so we keep the result for 5 minutes
// and serve that instead of calling Google on every request.
let cache = null;          // the last list of hotels we built
let cacheTime = 0;         // when we built it (ms)
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

const getHotels = catchAsync(async (req, res, next) => {
    const now = Date.now();

    // If we have fresh cached data, return it right away.
    if (cache && now - cacheTime < CACHE_MS) {
        return res.json({ status: "success", results: cache.length, data: cache });
    }

    // Otherwise read every hotel tab and parse the room tables.
    const sheets = await getHotelSheets();
    const hotels = parseHotels(sheets);

    if (!hotels.length) {
        return next(new AppError("No hotels found in the Google Sheet", 404));
    }

    // Save to cache for next time.
    cache = hotels;
    cacheTime = now;

    return res.json({ status: "success", results: hotels.length, data: hotels });
});

module.exports = getHotels;
