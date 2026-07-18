// Injecting envairoment variables from .env file in process.env object
require("dotenv").config();

// Modules
const express = require("express");

// Security Modules
const cors = require("cors");
const helmet = require("helmet");

// Configs
const connectDB = require("./configs/mongo.config");

// Routers
const hotelRouter = require("./routers/hotel.router");

// Global Error Handler
const globalErrorHandler = require("./controllers/error.controller");

// --------------------------------------IMPORTS--------------------------------------

const app = express();

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// Security Middlewares
app.use(cors());
app.use(helmet());

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
