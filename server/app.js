// Injecting envairoment variables from .env file in process.env object
require("dotenv").config();

// Modules
const express = require("express");

// Security Modules
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");

// Configs
const connectDB = require("./configs/mongo.config");

// Routers
const hotelRouter = require("./routers/hotel.router");

// Global Error Handler
const globalErrorHandler = require("./controllers/error.controller");
const mongoSanitaizeHandler = require("./middlewares/security.middleware");

// --------------------------------------IMPORTS--------------------------------------

const app = express();

app.use(hpp());

// Security Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["POST", "PATCH", "GET", "DELETE"]
}));


app.use(helmet());

// Parse incoming JSON request bodies into req.body
app.use(express.json());
app.use(mongoSanitaizeHandler);

// Mount all hotel routes under the /api/hotel prefix
app.use("/api/hotel", hotelRouter);

// Register the global error handler last so it catches errors from all routes above
app.use(globalErrorHandler);

// Port the server listens on, taken from the environment variables
const PORT = process.env.PORT;

// Start the HTTP server, then open the database connection
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);

    connectDB();
});
