import request from 'supertest'; 
import initApp from '../server';
import mongoose from "mongoose";
import { Express } from 'express';
import commentsModel from '../models/comments_model';
import userModel from '../models/user_model';

let app: Express;

type UserInfo = {
    email: string,
    password: string,
    username: string,
    token?: string,
    _id?: string
};

const userInfo: UserInfo = {
    email: "testuser@example.com",
    password: "123456",
    username: "testuser"
};

let postId = "";

beforeAll(async () => {
    app = await initApp();
    await commentsModel.deleteMany();
    await userModel.deleteMany();
    
    // Register user
    const registerResponse = await request(app)
        .post("/auth/register")
        .send(userInfo);
    expect(registerResponse.statusCode).toBe(201);
    
    // Login user
    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: userInfo.email,
            password: userInfo.password
        });
    expect(loginResponse.statusCode).toBe(200);
    userInfo.token = loginResponse.body.accessToken;
    userInfo._id = loginResponse.body._id;

    // Create a test post
    const postResponse = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${userInfo.token}`)
        .send({
            title: "Test Post",
            content: "Test Content",
            owner: userInfo._id
        });
    expect(postResponse.statusCode).toBe(201);
    postId = postResponse.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments test suite", () => {
    test("Comment test get all", async () => {
        // Create a comment
        const commentResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Test comment",
                postId: postId,
                owner: userInfo._id
            });
        expect(commentResponse.statusCode).toBe(201);

        // Get all comments
        const response = await request(app)
            .get("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test Create Comment", async () => {
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Test comment",
                postId: postId,
                owner: userInfo.username
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe("Test comment");
        expect(response.body.postId).toBe(postId);
        expect(response.body.owner).toBe(userInfo._id);
    });

    test("Test Create invalid comment", async () => {
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                content: "Test comment" // Missing required fields
            });
        expect(response.statusCode).not.toBe(201);
    });

    
    
    test("Test get comment by id", async () => {
        // First create a comment
        const createResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Test comment for get by id",
                postId: postId,
                owner: userInfo._id
            });
        expect(createResponse.statusCode).toBe(201);
        const commentId = createResponse.body._id;

        // Then get the comment by its ID
        const response = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });

    test("Test get comment by id fail", async () => {
        // Use a valid format ObjectId that doesn't exist
        const invalidId = new mongoose.Types.ObjectId().toString();
        const response = await request(app)
            .get(`/comments/${invalidId}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(404);
    });

    test("Test update comment by id", async () => {
        // First create a comment
        const createResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Original comment",
                postId: postId,
                owner: userInfo._id
            });
        expect(createResponse.statusCode).toBe(201);
        const commentId = createResponse.body._id;

        // Then update it
        const response = await request(app)
            .put(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Updated comment"
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.data.comment).toBe("Updated comment");
    });
    
    test("Test update comment fail, wrong id", async () => {
        // Use a valid format ObjectId that doesn't exist
        const invalidId = new mongoose.Types.ObjectId().toString();
        const response = await request(app)
            .put(`/comments/${invalidId}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Updated comment"
            });
    
        expect(response.statusCode).toBe(404);
    });

    test("Test update comment fail, no token", async () => {
        const response = await request(app)
            .put(`/comments/${postId}`)
            .send({
                comment: "Updated comment"
            });
    
        expect(response.statusCode).toBe(401);
    });

    test("Test update comment fail, wrong token", async () => {
        const response = await request(app)
            .put(`/comments/${postId}`)
            .set("Authorization", `Bearer ${userInfo.token}1`)
            .send({
                comment: "Updated comment"
            });
    
        expect(response.statusCode).toBe(401);
    });

    test("Test delete comment", async () => {
        // First create a comment
        const createResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                comment: "Comment to delete",
                postId: postId,
                owner: userInfo.username
            });
        expect(createResponse.statusCode).toBe(201);
        const commentId = createResponse.body._id;

        // Then delete it
        const response = await request(app)
            .delete(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);

        // Verify it's deleted
        const getResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(getResponse.statusCode).toBe(404);
    });
});
