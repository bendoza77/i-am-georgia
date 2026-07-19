// Models
const Hotel = require("../models/hotel.model");

// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { safeArray } = require("../utils/safeParse");

// --------------------------------------IMPORTS--------------------------------------

// GET /api/hotel/all
// Returns a paginated list of hotels sorted by newest first, plus the total count.
const getAllHotels = catchAsync(async (req, res, next) => {
    // Read pagination params from the query string, falling back to defaults when missing/invalid
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Fetch one page of hotels (skip previous pages, limit to the page size)
    const hotels = await Hotel.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    // Total number of hotels in the collection (used by the client for pagination)
    const hotelsCount = await Hotel.countDocuments();

    res.status(200).json({
        status: "success",
        message: "Hotels returned successfully!",
        hotelsCount,
        data: {
            hotels
        }
    });
});

// GET /api/hotel/:id
// Returns a single hotel by its MongoDB _id.
const getHotelById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);

    // If no hotel matches the given id, forward a 404 error to the error handler
    if (!hotel) {
        return next(new AppError("Hotel not found!", 404));
    };

    res.status(200).json({
        status: "success",
        message: "Hotel returned successfully!",
        data: {
            hotel
        }
    });
});

// POST /api/hotel/handle-hotel-change
// Upserts a hotel parsed from a Google Sheet import. Each sheet maps to one hotel document.
const handleHotelChange = async (req, res) => {
    try {
        const { sheetName, sheetGid, hotelData } = req.body;
        const { id } = req.params;

        // Reject the request when required fields are missing
        if (!sheetGid || !sheetName || !hotelData) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing sheetName, sheetGid or hotelData in request body',
            });
        }

        // Skip sheets that contain no usable hotel data (no name or a reported error)
        if (hotelData.hotel_name === null || hotelData.error) {
            console.log(`[hotel-import] Sheet "${sheetName}" skipped: ${hotelData.error || 'no hotel_name'}`);

            return res.status(200).json({
                status: 'skipped',
                reason: hotelData.error || 'no hotel data found',
            });
        }

        // The model returned text that could not be parsed as JSON — report it as unprocessable
        if (hotelData.raw_response) {
            console.log(`[hotel-import] Sheet "${sheetName}" invalid JSON from model`);

            return res.status(422).json({
                status: 'invalid_json',
                message: 'Model returned unparsable JSON',
                raw: hotelData.raw_response,
            });
        }

        // Find the hotel by its sheet id and update it, or create it if it does not exist yet (upsert).
        // The nested maps convert the snake_case shape coming from the sheet into the schema's camelCase shape.
        const hotel = await Hotel.findOneAndUpdate(
            { sheetGid },
            {
                sheetName,
                sheetGid,
                hotelName: hotelData.hotel_name,
                year: hotelData.year,
                currency: hotelData.currency,
                seasons: (hotelData.seasons || []).map(s => ({
                    periodLabel: s.period_label,
                    roomTypes: (s.room_types || []).map(rt => ({
                        roomType: rt.room_type,
                        prices: (rt.prices || []).map(p => ({
                            occupancy: p.occupancy,
                            mealPlan: p.meal_plan,
                            price: p.price
                        }))
                    }))
                })),
                mealPlanNotes: safeArray(hotelData.meal_plan_notes),
                childrenPolicy: safeArray((hotelData.children_policy || [])).map(c => ({
                    ageRange: c.age_range,
                    condition: c.condition
                })),
                extraCharges: safeArray(hotelData.extra_charges),
                rawNotes: safeArray(hotelData.raw_notes)
            },
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        console.log(`Hotel Created / Updated: ${hotel.hotelName}`);

        return res.status(200).json({
            status: 'success',
            id: hotel._id,
            hotel_name: hotel.hotelName
        });
    } catch (err) {
        // Any unexpected failure (validation, DB error, etc.) returns a generic 500
        return res.status(500).json({
            status: 'error',
            message: 'Failed to save hotel data'
        });
    };
};

module.exports = { getAllHotels, getHotelById, handleHotelChange };