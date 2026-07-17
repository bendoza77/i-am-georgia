const sentErrorDev = (err, res) => {

    return res.status(err.statusCode).json({
        status: err.status || "error",
        statusCode: err.statusCode || 500,
        message: err.message,
        stack: err.stack,
        err
    })

}

const senErrorProd = (err, res) => {

    return res.status(err.statusCode).json({
        status: err.status || "error",
        statusCode: err.statusCode || 500,
        message: err.message
    })


}

const GlobalErrorHandler = (err, req, res, next) => {

    if (process.env.NODE_ENV === "dev") {
        sentErrorDev(err, res);
    } else if (process.env.NODE_ENV === "prod") {
        senErrorProd(err, res);
    }


}

module.exports = GlobalErrorHandler;