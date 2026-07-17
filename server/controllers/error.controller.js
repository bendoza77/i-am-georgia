const sentErrorDev = (err, res) => {

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        status: err.status || "error",
        statusCode,
        message: err.message,
        stack: err.stack,
        err
    })

}

const senErrorProd = (err, res) => {

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        status: err.status || "error",
        statusCode,
        message: err.message
    })


}

const GlobalErrorHandler = (err, req, res, next) => {

    // Log the real error so we can see what actually went wrong in the terminal.
    console.error("ERROR:", err);

    if (process.env.NODE_ENV === "prod") {
        senErrorProd(err, res);
    } else {
        // dev (or anything that isn't prod) -> full details
        sentErrorDev(err, res);
    }

}

module.exports = GlobalErrorHandler;
