// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Tests for /industries routes.
 */


process.env.NODE_ENV = "test";

const request = require("supertest");

const { app } = require("../app");
const { db } = require("../db");

let testInd01;
let testInd02;


beforeAll(async () => {

    // Delete table data
    await db.query(`
        DELETE FROM companies_industries`);

    await db.query(`
        DELETE FROM industries`);

    await db.query(`
        DELETE FROM companies`);
})

beforeEach(async () => {

    // Add initial industry data
    const indRes = await db.query(`
        INSERT INTO industries (code, industry)
        VALUES
            ('ind1', 'Industry 01'),
            ('ind2', 'Industry 02')
        RETURNING code, industry`
    )

    testInd01 = indRes.rows[0];
    testInd02 = indRes.rows[1];
})

afterEach(async () => {

    // Delete table data created by tests
    await db.query(`
        DELETE FROM companies_industries`);

    await db.query(`
        DELETE FROM industries`);

    await db.query(`
        DELETE FROM companies`);
})

afterAll(async () => {

    // Close DB connection
    await db.end();
})


test("Temp", () => {
    expect(1).toEqual(1);
})
