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

let testComp01;
let testComp02;


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
    );

    testInd01 = indRes.rows[0];
    testInd02 = indRes.rows[1];

    // Add initial company data
    const compRes = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('comp01', 'Test Company 01', 'Desc 01'),
               ('comp02', 'Test Company 02', 'Desc 02')
        RETURNING code, name, description`
    );

    testComp01 = compRes.rows[0];
    testComp02 = compRes.rows[1];

    // Add company-industry associations
    await db.query(`
        INSERT INTO companies_industries (comp_code, ind_code)
        VALUES
            ('comp01', 'ind1'),
            ('comp01', 'ind2'),
            ('comp02', 'ind2')`
    );
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


describe("GET /industries", () => {

    test("Gets a list of industries", async () => {
        const response = await request(app).get("/industries");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            industries: [testInd01, testInd02]
        });
    })
})


describe("GET /industries/:code", () => {

    test("Gets data about an existing industry", async () => {
        const response = await request(app).get(`/industries/${testInd01.code}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            industry: {
                code: testInd01.code,
                industry: testInd01.industry,
                companies: expect.any(Array)
            }
        })
    })

    test("Returned industry data shows the correct associated company info", async () => {
        const response = await request(app).get(`/industries/${testInd02.code}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body.industry.companies).toEqual([testComp01.code, testComp02.code]);
    })

    test("Returns 404 response for a nonexistent industry", async () => {
        const response = await request(app).get("/industries/nonexistent");

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            error: {
                status: 404,
                message: "Industry not found!"
            }
        });
    })
})

describe("POST /industries", () => {

    test("Successfully creates a new industry", async () => {
        const newInd = {
            code: "newind",
            industry: "New Industry"
        };

        const response = await request(app)
            .post("/industries")
            .send(newInd);

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({industry: newInd});
    })
})

// describe("POST /industries/:code", () => {

//     test("Successfully associates an industry with a company", async () => {

//     })
// })
