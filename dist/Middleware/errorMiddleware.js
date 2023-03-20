"use strict";
let errorHandler = (err, _req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        //additional info if in dev mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};
module.exports = {
    errorHandler
};
