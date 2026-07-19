// Sends a detailed error response for the development environment,
// including the message, stack trace and the raw error object for debugging.
const sendErrorDev = (err, res) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    res.status(statusCode).json({
        status,
        message: err.message,
        stack: err.stack,
        err
    });
};

// Sends a safe error response for the production environment,
// hiding internal details from the client.
const sendErrorProd = (err, res) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    // Known/handled (operational) errors: expose the real status code and message
    if (err.isOperational) {
        res.status(statusCode).json({
            status,
            message: err.message
        });
    };

    // Unexpected/programming errors: log them and return a generic 500 response
    console.log("Internal Server Error", err);

    res.status(500).json({
        status: "error",
        message: "Something went wrong!"
    });
};

// Express global error-handling middleware: picks the response format based on the environment.
const globalErrorHandler = (err, req, res, next) => {
    // In dev mode return verbose errors, otherwise return sanitized production errors
    if (process.env.NODE_MODE === "dev") {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    };
};

module.exports = globalErrorHandler;