// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/** BizTime Express application. */


const express = require("express");

const app = express();
const { router: companiesRoutes } = require("./routes/companies");
const { router: invoicesRoutes } = require("./routes/invoices");
const { router: industriesRoutes } = require("./routes/industries");
const { ExpressError } = require("./expressError");

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industriesRoutes);


/** 404 handler */
app.use(function(req, res, next) {
    const err = new ExpressError("Page not found!", 404);
    return next(err);
});


/** General error handler */
app.use((err, req, res, next) => {
    res.status(err.status || 500);

    return res.json({
        error: {
            status: err.status,
            message: err.message
        }
    });
});


module.exports = {
    app
};
