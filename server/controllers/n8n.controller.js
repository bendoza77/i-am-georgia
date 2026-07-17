const AppError = require("../utils/AppError.util");
const catchAsync = require("../utils/catchAsync.util");

const getHotelInfo = catchAsync(async (req, res, next) => {

    const hotelInfo = req.body;

    console.log(hotelInfo);

    return res.json(hotelInfo);


})

module.exports = getHotelInfo;