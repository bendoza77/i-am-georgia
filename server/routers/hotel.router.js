const express = require("express");
const getHotels = require("../controllers/hotel.controller");

const hotelRouter = express.Router();

// GET /api/hotels  -> returns all hotels from the Google Sheet
hotelRouter.get("/", getHotels);

module.exports = hotelRouter;
