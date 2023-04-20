// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Routes for companies.
 */


const express = require("express");
const slugify = require("slugify");
const router = express.Router();

const { ExpressError } = require("../expressError");
const { db } = require("../db");


/**
 * Get list of all companies: {companies: [{code, name, description}, ...]}
 */
router.get("/", async (req, res, next) => {

    try {
        const results = await db.query(
            `SELECT code, name, description FROM companies`
        );

        return res.json({companies: results.rows});

    } catch(err) {
        return next(err);
    }
})


/**
 * Get a specific company, by company code:
 *      {company: {code, name, description, invoices: [id, ...], industries: [code, ...]}}
 *
 * If company cannot be found, return 404 status response.
 */
router.get("/:code", async (req, res, next) => {

    try {
        const compQuery = db.query(
            `SELECT code, name, description FROM companies
             WHERE code = $1`,
             [req.params.code]
        );

        const invQuery = db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
             FROM invoices
             WHERE comp_code = $1`,
             [req.params.code]
        );

        const indQuery = db.query(
            `SELECT ind.code, industry
             FROM companies AS comp
             JOIN companies_industries as comp_ind
                ON comp.code = comp_ind.comp_code
             JOIN industries as ind
             ON comp_ind.ind_code = ind.code
             WHERE comp.code = $1`,
             [req.params.code]
        );

        const queryResults = await Promise.all([compQuery, invQuery, indQuery]);
        const compRes = queryResults[0];
        const invRes = queryResults[1];
        const indRes = queryResults[2];

        // Throw error if company not found
        if (compRes.rows.length === 0) {
            throw new ExpressError("Company not found!", 404);
        }

        const company = compRes.rows[0];
        company.invoices = invRes.rows;
        company.industries = indRes.rows;

        return res.json({company});

    } catch(err) {
        return next(err);
    }
})


/**
 * Add a new company.
 *
 * Request body format (JSON): {name, description}
 *
 * Returns JSON with added company info, if successful: {company: {code, name, description}}
 */
router.post("/", async (req, res, next) => {

    try {
        const {name, description} = req.body;
        const code = slugify(req.body.name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
            [code, name, description]
        );

        return res.status(201).json({company: result.rows[0]});

    } catch(err) {
        return next(err);
    }
})


/**
 * Update an existing company.
 *
 * If company cannot be found, return 404 status response.
 *
 * Request body format (JSON): {name, description}
 *
 * Returns JSON with updated company info, if successful: {company: {code, name, description}}
 */
router.put("/:code", async (req, res, next) => {

    try {
        const {name, description} = req.body;
        const result = await db.query(
            `UPDATE companies
             SET name = $1, description = $2
             WHERE code = $3
             RETURNING code, name, description`,
            [name, description, req.params.code]
        );

        // Throw error if company not found
        if (result.rows.length === 0) {
            throw new ExpressError("Company not found!", 404);
        }

        return res.json({company: result.rows[0]});

    } catch(err) {
        return next(err);
    }
})


/**
 * Delete a company.
 *
 * If company cannot be found, return 404 status response.
 *
 * Return JSON on success: {status: "deleted"}
 */
router.delete("/:code", async (req, res, next) => {

    try {
        const result = await db.query(
            `DELETE FROM companies
             WHERE code = $1
             RETURNING code`,
             [req.params.code]
        );

        // Throw error if company not found
        if (result.rows.length === 0) {
            throw new ExpressError("Company not found!", 404);
        }

        return res.json({"status": "deleted"});

    } catch(err) {
        return next(err);
    }
})


module.exports = {
    router
};
