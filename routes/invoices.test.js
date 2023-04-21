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
               ('${testComp.code}', 777, true, '2018-01-01')
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


describe("GET /invoices", () => {

    test("Gets a list of invoices", async () => {

        // Extract the needed invoice object properties
        const expInvs = [testInv01, testInv02].map((inv) => {
            const {id, comp_code} = inv;
            return {id, comp_code};
        });

        const response = await request(app).get("/invoices");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoices: expInvs
        });
    })

})

describe("GET /invoices/:id", () => {

    test("Gets data about an existing invoice", async () => {
        const response = await request(app).get(`/invoices/${testInv01.id}`);

        const {comp_code, ...expInv} = testInv01;
        expInv.company = testComp;

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({

            // Jsonify expInv properties and values, due to Date object in expInv
            invoice: JSON.parse(JSON.stringify(expInv))
        });
    })

    test("Returns 404 response for a nonexistent invoice", async () => {
        const response = await request(app).get("/invoices/0");

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Invoice not found!"
            }
        });
    })
})

describe("POST /invoices", () => {

    test("Successfully creates a new invoice", async () => {
        const newInv = {
            comp_code: "comp",
            amt: 888
        };

        const response = await request(app)
            .post("/invoices")
            .send(newInv);

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: newInv.comp_code,
                amt: newInv.amt,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    })
})

describe("PUT /invoices/:id", () => {

    test("Successfully edits an existing invoice", async () => {
        const invData = {amt: 1111, paid: false};
        const response = await request(app)
            .put(`/invoices/${testInv01.id}`)
            .send(invData);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: testInv01.comp_code,
                amt: invData.amt,
                paid: invData.paid,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    })

    test("Successfully updates an existing invoice's paid date", async () => {
        const invData = {amt: 1111, paid: true};
        const response = await request(app)
            .put(`/invoices/${testInv01.id}`)
            .send(invData);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: testInv01.comp_code,
                amt: invData.amt,
                paid: invData.paid,
                add_date: expect.any(String),
                paid_date: expect.any(String)
            }
        });
    })

    test("Returns 404 response for a nonexistent invoice", async () => {
        const invData = {amt: 1111, paid: false};
        const response = await request(app)
            .put("/invoices/0")
            .send(invData);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Invoice not found!"
            }
        });
    })
})

describe("DELETE /invoices/:id", () => {

    test("Successfully deletes an existing invoice", async () => {
        const response = await request(app).delete(`/invoices/${testInv01.id}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({status: "deleted"});

        // Check that the invoice was actually deleted from database
        const delInv = await db.query(`
            SELECT id FROM invoices
            WHERE id = $1`,
            [testInv01.id]
        );

        expect(delInv.rows.length).toEqual(0);
    })

    test("Returns 404 response for a nonexistent invoice", async () => {
        const response = await request(app).delete("/invoices/0");

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Invoice not found!"
            }
        });
    })
})
