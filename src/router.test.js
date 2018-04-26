const bodyParser = require('body-parser');
const express = require('express');
const supertest = require('supertest');

const router = require('..');

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(router(require("./router.test.routes")));

const request = supertest(server);

describe('Check routes', function () {
    describe("Top level request", () => {
        test("GET", async () => {
            const respone = await request.get('/');
            expect(respone.statusCode).toBe(200);
            expect(respone.body.received).toBe(true);
        });
        test("POST", async () => {
            const data = {
                this: "is",
                the: "body"
            };
            const respone = await request.post('/').send(data);
            expect(respone.statusCode).toBe(200);
            expect(respone.body).toEqual(data);
        })
    });
    describe("Deep request", () => {
        test("GET", async () => {
            const respone = await request.get('/a/deep/url/in/the/website');
            expect(respone.statusCode).toBe(200);
            expect(respone.body.received).toBe(true);
        });
        test("POST", async () => {
            const data = {
                this: "is",
                the: "body"
            };
            const respone = await request.post('/a/deep/url/in/the/website').send(data);
            expect(respone.statusCode).toBe(200);
            expect(respone.body).toEqual(data);
        })
    });
    describe("Dynamic request", () => {
        test("GET", async () => {
            const respone = await request.get('/a/dynamic/test');
            expect(respone.statusCode).toBe(200);
            expect(respone.body).toEqual({path: "test"});
        });
        test("POST", async () => {
            const data = {
                this: "is",
                the: "body"
            };
            const respone = await request.post('/a/dynamic/test').send(data);
            expect(respone.statusCode).toBe(200);
            expect(respone.body).toEqual({...data, path:"test"});
        })
    })
});