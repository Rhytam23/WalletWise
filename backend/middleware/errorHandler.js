const errHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error(err.stack || err);

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal Server Error" : err.message
    });
}

module.exports = errHandler;
