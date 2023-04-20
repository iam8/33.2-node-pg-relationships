// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Routes for industries.
 */


const express = require("express");
const router = express.Router();

const { ExpressError } = require("../expressError");
const { db } = require("../db");


/**
 * Get list of all industries: {industries: [{code, industry}, ...]}
 */
router.get("/", async (req, res, next) => {

    try {
        const indRes = await db.query(
            `SELECT code, industry
             FROM industries`
        );

        return res.json({industries: indRes.rows});

    } catch(err) {
        return next(err);
    }
})


/**
 * Get a specific industry, by industry code:
 *  {industry: {code, industry, companies: [code, ...]}
 *
 * If company cannot be found, return 404 status response.
 */
router.get("/:code", async (req, res, next) => {

    try {
        const result = await db.query(
            `SELECT ind.code as ind_code, ind.industry, comp.code as comp_code
            FROM industries AS ind
            LEFT JOIN companies_industries AS comp_ind
               ON ind.code = comp_ind.ind_code
            LEFT JOIN companies AS comp
               ON comp_ind.comp_code = comp.code
            WHERE ind.code = $1`,
            [req.params.code]
        );

        // Throw error if industry not found
        if (result.rows.length === 0) {
            throw new ExpressError("Industry not found!", 404);
        }

        const {ind_code: code, industry} = result.rows[0];
        const compCodes = result.rows.map((row) => {
            return row.comp_code;
        });

        return res.json({industry: {code, industry, companies: compCodes}});

    } catch(err) {
        return next(err);
    }
})


/**
 * Add a new industry:
 *
 * Request body format (JSON): {code, industry}
 *
 * Return JSON with added industry info, if successful: {industry: {code, industry}}
 */
router.post("/", async (req, res, next) => {

    try {
        const {code, industry} = req.body;
        const result = await db.query(
            `INSERT INTO industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`,
            [code, industry]
        );

        return res.status(201).json({industry: result.rows[0]});

    } catch(err) {
        return next(err);
    }
})


/**
 * Associate an industry (by code) with a company.
 *
 * Request body format (JSON): {comp_code}
 *
 * Return JSON with added industry-company association info, if successful:
 *      {association: {comp_code, ind_code}}
 */
router.post("/:code", async (req, res, next) => {

    try {
        const {comp_code} = req.body;
        const result = await db.query(
            `INSERT INTO companies_industries (comp_code, ind_code)
             VALUES ($1, $2)
             RETURNING comp_code, ind_code`,
            [comp_code, req.params.code]
        );

        return res.status(201).json({association: result.rows[0]});

    } catch(err) {
        return next(err);
    }
})


module.exports = {
    router
};
