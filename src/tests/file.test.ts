import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import path from 'path';
import fs from 'fs';

let app: Express;

beforeAll(async () => {
    app = await initApp();
    // Create storage directory if it doesn't exist
    if (!fs.existsSync('./storage')) {
        fs.mkdirSync('./storage');
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    // Clean up storage directory
    if (fs.existsSync('./storage')) {
        fs.readdirSync('./storage').forEach(file => {
            fs.unlinkSync(path.join('./storage', file));
        });
    }
});

describe("File Tests", () => {
    test("upload file", async () => {
        // Create a test file
        const testFilePath = path.join(__dirname, 'testimage.jpg');
        const testContent = 'Test image content';
        fs.writeFileSync(testFilePath, testContent);

        try {
            // Upload the file
            const response = await request(app)
                .post("/files")
                .attach('file', testFilePath);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.url).toBeDefined();
            
            // Get the file URL and clean it
            let url = response.body.url;
            url = url.replace(/^.*\/\/[^/]+/, '');
            
            // Try to get the file
            const getResponse = await request(app).get(url);
            expect(getResponse.statusCode).toBe(200);
        } catch (err) {
            console.error('Test error:', err);
            throw err; // Let the test fail with the actual error
        } finally {
            // Clean up the test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    });
});