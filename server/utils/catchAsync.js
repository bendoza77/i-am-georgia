// Wraps an async route handler so any rejected promise is forwarded to Express's
// error-handling middleware via next(), removing the need for try/catch in each handler.
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;