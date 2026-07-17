const express = require("express");
const {
    getHotels,
    refreshHotels,
    streamHotels,
    createHotel,
    updateHotel,
    removeHotel,
} = require("../controllers/hotel.controller");

const hotelRouter = express.Router();

// Guard for write routes. If ADMIN_SECRET is set, callers must send it as
// `x-admin-secret`. NOTE: this is a stopgap — a browser can't truly keep a
// secret. Replace with real admin auth (session/JWT) before production.
const requireAdmin = (req, res, next) => {
    const secret = process.env.ADMIN_SECRET;
    if (secret && req.get("x-admin-secret") !== secret) {
        return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }
    next();
};

// GET /api/hotels          -> all hotels (cached, background-refreshed)
hotelRouter.get("/", getHotels);

// GET /api/hotels/stream   -> Server-Sent Events; live "data changed" pushes
hotelRouter.get("/stream", streamHotels);

// POST /api/hotels/refresh -> webhook (Apps Script / write routes) busts cache
hotelRouter.post("/refresh", refreshHotels);

// --- Admin writes (write back to the Google Sheet) ---
hotelRouter.post("/", requireAdmin, createHotel);
hotelRouter.patch("/:id", requireAdmin, updateHotel);
hotelRouter.delete("/:id", requireAdmin, removeHotel);

module.exports = hotelRouter;
