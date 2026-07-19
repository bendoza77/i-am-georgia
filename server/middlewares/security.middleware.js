const mongoSanitaize = require("express-mongo-sanitize");

const mongoSanitaizeHandler = (req, res, next) => {

    const replaceOption = {replaceWith: "_"}

    if (req.body) mongoSanitaize.sanitize(req.body, replaceOption);
    if (req.params) mongoSanitaize.sanitize(req.params, replaceOption);
    if (req.query) mongoSanitaize.sanitize(req.query, replaceOption);

    next();

}

module.exports = mongoSanitaizeHandler;