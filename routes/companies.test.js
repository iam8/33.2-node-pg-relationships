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


beforeAll(async () => {

    // Delete any data in companies table
    await db.query(`
        DELETE FROM companies`);
})

beforeEach(async () => {

    // Add initial company data
    const result01 = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('comp01', 'Test Company 01', 'Desc 01')
        RETURNING code, name, description`);

    testComp01 = result01.rows[0];
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
