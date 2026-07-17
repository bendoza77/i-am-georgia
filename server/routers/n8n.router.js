const express = require("express");
const getHotelInfo = require("../controllers/n8n.controller");

const n8nRouter = express.Router();

n8nRouter.post("/hotel", getHotelInfo);

module.exports = n8nRouter