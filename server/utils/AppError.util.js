class AppError extends Error {
    constructor(message, statusCode) {
        super(message),
        this.statusCode = statusCode,
        this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error",
        this.stack = Error.captureStackTrace(constructor, this.constructor); 
    }
}

module.exports = AppError;