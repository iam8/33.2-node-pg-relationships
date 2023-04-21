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

describe("GET /companies/:code", () => {

    test("Gets data about an existing company", async () => {
        const response = await request(app).get(`/companies/${testComp01.code}`);

        const expComp = {...testComp01};  // Shallow copy
        expComp01.invoices = [];
        expComp01.industries = [];

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            company: expComp
        });
    })

    test("Returns 404 response for a nonexistent company", async () => {
        const response = await request(app).get("/companies/nonexistent");

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Company not found!"
            }
        });
    })
})

describe("POST /companies", () => {

    test("Successfully creates a new company", async () => {
        const newComp = {
            name: "New Company",
            description: "Desc of New Company"
        }

        const expComp = {...newComp};
        expComp.code = "new-company";

        const response = await request(app)
            .post("/companies")
            .send(newComp);

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            company: expComp
        });
    })
})

describe("PUT /companies/:code", () => {

    test("Successfully edits an existing company", async () => {
        const newData = {
            name: `Updated name`,
            description: `Updated desc`
        }

        const expComp = {...newData};
        expComp.code = `${testComp01.code}`;

        const response = await request(app)
            .put(`/companies/${testComp01.code}`)
            .send(newData);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({company: expComp});
    })

    test("Returns 404 response for a nonexistent company", async () => {
        const newData = {
            name: `Updated name`,
            description: `Updated desc`
        }

        const response = await request(app)
            .put("/companies/nonexistent")
            .send(newData);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Company not found!"
            }
        });
    })
})

describe("DELETE /companies/:code", () => {

    test("Successfully deletes an existing company", async () => {
        const response = await request(app).delete(`/companies/${testComp01.code}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({status: "deleted"});
    })

    test("Returns 404 response for a nonexistent company", async () => {
        const response = await request(app).delete("/companies/nonexistent");

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Company not found!"
            }
        });
    })
})
