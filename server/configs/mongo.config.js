// Modules
const mongoose = require("mongoose");

// --------------------------------------IMPORTS--------------------------------------

// Opens the connection to MongoDB using the URI from the environment variables
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected!");
    } catch (err) {
        // Log the error if the connection cannot be established
        console.log(err);
        process.exit(1);
    };
};

module.exports = connectDB;