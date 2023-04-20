// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Tests for /companies routes.
 */


process.env.NODE_ENV = "test";

const request = require("supertest");

const { app } = require("../app");
const { db } = require("../db");

let testComp01;
let testComp02;


beforeAll(async () => {

    // Delete any data in companies table
    await db.query(`
        DELETE FROM companies`);
})

beforeEach(async () => {

    // Add initial company data
    const results = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('comp01', 'Test Company 01', 'Desc 01'),
               ('comp02', 'Test Company 02', 'Desc 02')
        RETURNING code, name, description`);

    testComp01 = results.rows[0];
    testComp02 = results.rows[1];
})

afterEach(async () => {

    // Delete company data created by test
    await db.query(`
        DELETE FROM companies`);
})

afterAll(async () => {

    // Close DB connection
    await db.end();
})


describe("GET /companies", () => {

    test("Gets a list of companies", async () => {
        const response = await request(app).get("/companies");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testComp01, testComp02]
        });
    })
})

// describe("GET /companies/:code", () => {

// })

// describe("POST /companies", () => {

// })

// describe("PUT /companies/:code", () => {

// })

// describe("DELETE /companies/:code", () => {

// })
