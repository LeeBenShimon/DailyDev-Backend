import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import postModel from "../models/posts_model";
import userModel from "../models/user_model";
import commentsModel from "../models/comments_model";

let app: Express;

const testUser = {
    email: "testuser@example.com",
    password: "123456",
    username: "testuser",
    token: "",
    id: ""
};

const testPost = {
    title: "Test Post",
    content: "This is a test post.",
    owner: "" // Will be set after user creation
};

const testComment = {
    comment: "This is a test comment.",
    postId: "", // Will be set after post creation
    owner: "" // Will be set after user creation
};

let postId = "";
let commentId = "";

beforeAll(async () => {
    app = await initApp();
    await postModel.deleteMany();
    await userModel.deleteMany();
    await commentsModel.deleteMany();

    // Register and login the test user
    const registerResponse = await request(app)
        .post("/auth/register")
        .send(testUser);
    expect(registerResponse.statusCode).toBe(201);
    
    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: testUser.email,
            password: testUser.password
        });
    expect(loginResponse.statusCode).toBe(200);
    testUser.token = loginResponse.body.accessToken;
    testUser.id = loginResponse.body._id;
    testPost.owner = testUser.id;
    testComment.owner = testUser.id;

    // Create a test post
    const postResponse = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(testPost);
    expect(postResponse.statusCode).toBe(201);
    postId = postResponse.body._id;
    testComment.postId = postId;

    // Add a test comment
    const commentResponse = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(testComment);
    expect(commentResponse.statusCode).toBe(201);
    commentId = commentResponse.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Likes and Comments API Tests", () => {
    test("Like a post", async () => {
        const response = await request(app)
            .post(`/posts/${postId}/like`)
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({ userId: testUser.id });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Post liked successfully");

        // Verify the like count
        const post = await postModel.findById(postId);
        expect(post?.likes.length).toBe(1);
        expect(post?.likes[0].toString()).toBe(testUser.id);
    });

    test("Unlike a post", async () => {
        const response = await request(app)
            .post(`/posts/${postId}/unlike`)
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({ userId: testUser.id });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Post unliked successfully");

        // Verify the like count
        const post = await postModel.findById(postId);
        expect(post?.likes.length).toBe(0);
    });

    test("Fetch likes for a post", async () => {
        // Like the post again
        await request(app)
            .post(`/posts/${postId}/like`)
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({ userId: testUser.id });

        const response = await request(app)
            .get(`/posts/${postId}/likes`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]._id).toBe(testUser.id);
        expect(response.body[0].username).toBe(testUser.username);
    });

    test("Fetch comments for a post", async () => {
        const response = await request(app)
            .get(`/posts/${postId}/comments`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]._id).toBe(commentId);
        expect(response.body[0].comment).toBe(testComment.comment);
        expect(response.body[0].owner._id).toBe(testUser.id);
        expect(response.body[0].owner.username).toBe(testUser.username);
    });
});
