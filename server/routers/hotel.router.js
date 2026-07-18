// Modules
const express = require("express");

// Controllers
const { getAllHotels, getHotelById, handleHotelChange } = require("../controllers/hotel.controller");

// --------------------------------------IMPORTS--------------------------------------

const hotelRouter = express.Router();

// GET /api/hotel/all -> paginated list of all hotels
hotelRouter.get("/all", getAllHotels);
// GET /api/hotel/:id -> single hotel by id
hotelRouter.get("/:id", getHotelById);
// POST /api/hotel/handle-hotel-change -> create/update a hotel from a sheet import
hotelRouter.post("/handle-hotel-change", handleHotelChange);

module.exports = hotelRouter;