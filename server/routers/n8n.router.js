const express = require("express");
const getHotelInfo = require("../controllers/n8n.controller");

const n8nRouter = expres.Router();

n8nRouter.post("/hotel", getHotelInfo);

module.exports = n8nRouter