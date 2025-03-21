import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import path from 'path';

let app: Express;

beforeAll(async () => {
    app = await initApp();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("File Tests", () => {
    test("upload file", async () => {
        
        const filePath = path.join(__dirname, 'testimage.jpg');
        console.log(filePath);
        try {
            const response = await request(app)
                .post("/file?file=testimage.jpg").attach('file', filePath)
            expect(response.statusCode).toEqual(200);
            let url = response.body.url;
            console.log(url);
            url = url.replace(/^.*\/\/[^/]+/, '')
            console.log(url);
            const res = await request(app).get(url)
            expect(res.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
            expect(1).toEqual(2);
        }
    })
})