// Custom error class for predictable, operational errors thrown by the app.
// Carries an HTTP status code so the error handler can respond appropriately.
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;

        // 4xx codes are treated as client "fail"; everything else as server "error"
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

        // Flags this as a known/handled error (as opposed to an unexpected bug)
        this.isOperational = true;

        // Exclude this constructor from the captured stack trace
        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = AppError;