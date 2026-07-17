// Load .env FIRST, before any other module is required.
// The Google auth object is built when its module loads, so the
// credentials must already be in process.env by then.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const hotelRouter = require("./routers/hotel.router");
const GlobalErrorHandler = require("./controllers/error.controller");

const app = express();

app.use(cors( 
    {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
));          // allow the client (different port) to call this API
app.use(express.json());

app.use("/api/hotels", hotelRouter);

app.get("/", (req, res) => {
    return res.send("hello world");
});

app.use(GlobalErrorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
