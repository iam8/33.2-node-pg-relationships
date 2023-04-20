// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Routes for invoices.
 */


const express = require("express");
const router = express.Router();

const { ExpressError } = require("../expressError");
const { db } = require("../db");


/**
 * Get list of all invoices: {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async (req, res, next) => {

    try {
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`
        );

        return res.json({invoices: results.rows});

    } catch(err) {
        return next(err);
    }
})


/**
 * Get a specific invoice, by invoice ID:
 *      {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
 *
 * If invoice cannot be found, return 404 status response.
 */
router.get("/:id", async (req, res, next) => {

    try {
        const result = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, code, name, description
             FROM invoices JOIN companies
             ON invoices.comp_code = companies.code
             WHERE id = $1`,
            [req.params.id]
        );

        // Throw error if invoice not found
        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found!", 404);
        }

        // Construct and return response
        const {code, name, description, ...invData} = result.rows[0];
        invData.company = {code, name, description};
        return res.json({invoice: invData});

    } catch(err) {
        return next(err);
    }
})


/**
 * Add a new invoice.
 *
 * Request body format (JSON): {comp_code, amt}
 *
 * Return JSON with added invoice info, if successful:
 *      {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async (req, res, next) => {

    try {
        const {comp_code, amt} = req.body;
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
             [comp_code, amt]
        );

        return res.status(201).json({invoice: result.rows[0]});

    } catch(err) {
        return next(err);
    }
})


/**
 * Update an existing invoice.
 *
 * If invoice cannot be found, return 404 status response.
 *
 * Request body format (JSON): {amt, paid}
 *
 * Return JSON with updated invoice info, if successful:
 *      {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async (req, res, next) => {

    try {
        const { amt, paid } = req.body;

        // Method 1: SQL query
        const fullQuery = `
            UPDATE invoices
            SET amt = $1, paid = $2, paid_date =
            CASE
                WHEN $2 = TRUE AND paid_date IS NULL THEN CURRENT_DATE
                WHEN $2 = FALSE THEN NULL
                ELSE paid_date
            END
            WHERE id = $3
            RETURNING id, comp_code, amt, paid, add_date, paid_date`

        const result = await db.query(fullQuery, [amt, paid, req.params.id]);

        // Throw error if invoice not found
        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found!", 404);
        }

        return res.json({invoice: result.rows[0]});

        // Method 2: two queries in series
        // const selectRes = await db.query(
        //     `SELECT paid_date FROM invoices
        //      WHERE id = $1`,
        //      [req.params.id]
        // );

        // // Throw error if invoice not found
        // if (selectRes.rows.length === 0) {
        //     throw new ExpressError("Invoice not found!", 404);
        // }

        // const paidDate = selectRes.rows[0].paid_date;
        // let updatedPaidDate;

        // // Adjust value of paid date
        // if (paid & !paidDate) {
        //     updatedPaidDate = new Date(); //  Current date
        // } else if (!paid) {
        //     updatedPaidDate = null;
        // } else {
        //     updatedPaidDate = paidDate;
        // }

        // const updateRes = await db.query(
        //     `UPDATE invoices
        //      SET amt = $1, paid = $2, paid_date = $3
        //      WHERE id = $4
        //      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        //      [amt, paid, updatedPaidDate, req.params.id]
        // );

        // return res.json({invoice: updateRes.rows[0]});

    } catch(err) {
        return next(err);
    }
})


/**
 * Delete an invoice.
 *
 * If invoice cannot be found, return 404 status response.
 *
 * Return JSON on success: {status: "deleted"}
 */
router.delete("/:id", async (req, res, next) => {

    try {
        const result = await db.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING id`,
             [req.params.id]
        );

        // Throw error if invoice not found
        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found!", 404);
        }

        return res.json({"status": "deleted"});

    } catch(err) {
        return next(err);
    }
})



module.exports = {
    router
};
