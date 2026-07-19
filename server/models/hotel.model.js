// Modules
const mongoose = require("mongoose");

// --------------------------------------IMPORTS--------------------------------------

// extraCharges has a field literally named "type", which is a reserved Mongoose key.
// typeKey switches the type-declaration key to "$type" so "type" becomes a regular field.
const extraChargeSchema = new mongoose.Schema({
    type: String,
    price: Number,
    currency: String
}, { typeKey: "$type", _id: false });

// Main hotel schema: one document per imported sheet, holding pricing data
// broken down by season, room type and occupancy/meal-plan combinations.
const hotelSchema = new mongoose.Schema({
    sheetName: {
        type: String,
        required: true
    },
    sheetGid: {
        type: String,
        required: true,
        unique: true
    },
    hotelName: {
        type: String,
        required: true
    },
    year: {
        type: Number
    },
    currency: {
        type: String
    },
    seasons: [{
        periodLabel: String,
        roomTypes: [{
            roomType: String,
            prices: [{
                occupancy: String,
                mealPlan: String,
                price: Number
            }]
        }]
    }],
    mealPlanNotes: [String],
    childrenPolicy: [{
        ageRange: String,
        condition: String
    }],
    extraCharges: [extraChargeSchema],
    rawNotes: [String]
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;