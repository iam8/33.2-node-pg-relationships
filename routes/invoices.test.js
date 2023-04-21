// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Tests for /invoices routes.
 */


process.env.NODE_ENV = "test";

const request = require("supertest");

const { app } = require("../app");
const { db } = require("../db");

let testComp;
let testInv01;
let testInv02;


beforeAll(async () => {

    // Delete any data in invoices and companies table
    await db.query(`
        DELETE FROM invoices`);

    await db.query(`
        DELETE FROM companies`);
})

beforeEach(async () => {

    // Add initial company data
    const compRes = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('comp', 'Test Company', 'Desc')
        RETURNING code, name, description`);

    testComp = compRes.rows[0];

    // Add initial invoice data
    const invRes = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ('${testComp.code}', 333, false, null),
               ('${testComp.code}', 777, true, '2018-01-01'),
        RETURNING id, comp_code, amt, paid, add_date, paid_date`);

    testInv01 = invRes.rows[0];
    testInv02 = invRes.rows[1];
})

afterEach(async () => {

    // Delete data created by test
    await db.query(`
        DELETE FROM invoices`);

    await db.query(`
        DELETE FROM companies`);
})

afterAll(async () => {

    // Close DB connection
    await db.end();
})
