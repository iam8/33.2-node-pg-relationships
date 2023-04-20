// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/**
 * Tests for /industries routes.
 */


process.env.NODE_ENV = "test";

const request = require("supertest");

const { app } = require("../app");
const { db } = require("../db");
