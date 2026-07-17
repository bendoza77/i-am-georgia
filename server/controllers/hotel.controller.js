const catchAsync = require("../utils/catchAsync.util");
const AppError = require("../utils/AppError.util");
const store = require("../services/hotelStore");
const { upsertHotel, deleteHotel } = require("../services/googleSheets.service");
const { toId } = require("../utils/parseHotels.util");

// Pull just the fields we persist off the request body, so a client can't push
// arbitrary keys into the sheet. `rooms`/`notes` shape the pricing tab; the
// rest become the Meta row.
const pickHotel = (body = {}) => ({
    name: String(body.name || "").trim(),
    type: body.type || "",
    city: body.city || "",
    address: body.address || "",
    tagline: body.tagline || "",
    description: body.description || "",
    stars: body.stars ?? null,
    currency: body.currency || "",
    rating: body.rating ?? null,
    reviews: body.reviews ?? null,
    roomsCount: body.roomsCount ?? null,
    images: Array.isArray(body.images) ? body.images : [],
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    status: body.status || "draft",
    featured: !!body.featured,
    available: body.available !== false,
    checkIn: body.checkIn || "",
    checkOut: body.checkOut || "",
    rooms: Array.isArray(body.rooms) ? body.rooms : [],
    notes: Array.isArray(body.notes) ? body.notes : [],
});

// GET /api/hotels -> the current list (served from cache, refreshed in the
// background when stale — see hotelStore).
const getHotels = catchAsync(async (req, res, next) => {
    const hotels = await store.getHotels();

    if (!hotels.length) {
        return next(new AppError("No hotels found in the Google Sheet", 404));
    }

    return res.json({ status: "success", results: hotels.length, data: hotels });
});

// POST /api/hotels/refresh -> webhook the Google Apps Script (and our own write
// routes) call after an edit. Rebuilds from the sheet and pushes to open tabs.
// Protected by a shared secret so randoms can't force Google reads.
const refreshHotels = catchAsync(async (req, res, next) => {
    const secret = process.env.REFRESH_SECRET;
    const given = req.get("x-refresh-secret") || req.query.secret;

    if (secret && given !== secret) {
        return next(new AppError("Invalid refresh secret", 401));
    }

    const hotels = await store.refresh();
    return res.json({ status: "success", results: hotels.length });
});

// GET /api/hotels/stream -> Server-Sent Events. The browser keeps this open and
// gets an event every time the data changes, then re-fetches /api/hotels.
const streamHotels = (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
    });
    res.write("retry: 5000\n\n"); // tell the browser how long to wait before reconnecting

    const unsubscribe = store.subscribe(res);

    // Heartbeat comment keeps proxies from closing an idle connection.
    const ping = setInterval(() => res.write(": ping\n\n"), 25000);

    req.on("close", () => {
        clearInterval(ping);
        unsubscribe();
    });
};

// POST /api/hotels -> create a hotel (new pricing tab + Meta row), then refresh.
const createHotel = catchAsync(async (req, res, next) => {
    const hotel = pickHotel(req.body);
    if (!hotel.name) return next(new AppError("Hotel name is required", 400));

    hotel.id = toId(hotel.name);
    hotel.title = hotel.name;

    await upsertHotel(hotel);
    await store.refresh(); // rebuild cache + push to open tabs

    return res.status(201).json({ status: "success", data: { id: hotel.id } });
});

// PATCH /api/hotels/:id -> update an existing hotel.
const updateHotel = catchAsync(async (req, res, next) => {
    const hotels = await store.getHotels();
    const current = hotels.find((h) => h.id === req.params.id);
    if (!current) return next(new AppError("Hotel not found", 404));

    // Merge the incoming changes over what's already stored, so a partial
    // PATCH doesn't wipe fields the client didn't send.
    const hotel = { ...current, ...pickHotel({ ...current, ...req.body }) };
    hotel.id = current.id;
    hotel.title = current.title || current.name; // keep the existing tab name

    await upsertHotel(hotel);
    await store.refresh();

    return res.json({ status: "success", data: { id: hotel.id } });
});

// DELETE /api/hotels/:id -> remove a hotel's tab + Meta row.
const removeHotel = catchAsync(async (req, res, next) => {
    const hotels = await store.getHotels();
    const current = hotels.find((h) => h.id === req.params.id);
    if (!current) return next(new AppError("Hotel not found", 404));

    await deleteHotel(current.id, current.title || current.name);
    await store.refresh();

    return res.json({ status: "success" });
});

module.exports = {
    getHotels,
    refreshHotels,
    streamHotels,
    createHotel,
    updateHotel,
    removeHotel,
};
