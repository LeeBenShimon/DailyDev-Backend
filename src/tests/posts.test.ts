import request from 'supertest'; 
import initApp from '../server';
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from 'express';
import userModel from '../models/user_model';

let app:Express;

type UserInfo = {
    email: string,
    password: string,
    token?: string,
    _id?: string
};

const testUser = {
    email: "test@user.com",
    password: "123456",
    token: "",
    id:""
}

const testUser2 = {
    email: "test@user777.com",
    password: "123456",
    token: "",
    id:""
}

const userInfo: UserInfo = {
    email: "leebenshimon14@gmail.com",
    password: "123456"
}

beforeAll(async () => {
    app = await initApp();
    await postModel.deleteMany();
    await userModel.deleteMany();
    await request(app).post("/auth/register").send(userInfo);
    const response = await request(app).post("/auth/login").send(userInfo);
    userInfo.token = response.body.accessToken;
    userInfo._id = response.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

let postId = "";
const testPost = {
    "owner": "Lee",
    "title": "My first post",
    "content": "This is my first post!"
};
const invalidPost = {
    title: "Test title",
    content: "Test content",
};
const updatedPost = {
    title: "Updated title",
    content: "Updated content",
};

describe("Posts test suite", () => {
    test("Test get all posts", async () => {
       const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    test("Test Create Post", async () => {
        const response = await request(app).post("/posts")
        .set({authorization: "JWT " + userInfo.token})
        .send(testPost);
        expect(response.statusCode).toBe(201);
        expect(response.body.owner).toBe(testPost.owner);
        expect(response.body.title).toBe(testPost.title);
        expect(response.body.content).toBe(testPost.content);    
        postId = response.body._id;
    });

    test("Test adding invalid post", async () => {
        const response = await request(app).post("/posts").set({
            authorization: "JWT " + testUser.token,
        }).send(invalidPost);
        expect(response.statusCode).not.toBe(201);
    });

    test("Test get all posts after adding", async () => {
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test get post by owner", async () => {
        const response = await request(app).get("/posts?owner=" + testPost.owner);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].owner).toBe(testPost.owner);
    });
    
    test("Test get post by id", async () => {
        const response = await request(app).get("/posts/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });

    test("Test get post by id fail", async () => {
        const response = await request(app).get("/posts/678e9d7c4d3809be848c1fda");
        expect(response.statusCode).toBe(200);
    });

    test("Test update post by id", async () => {
        const response = await request(app)
            .put("/posts/" + postId)
            .set({
                authorization: "JWT " + userInfo.token
            })
            .send(updatedPost);

        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedPost.content);
        expect(response.body.title).toBe(updatedPost.title);
    });

    test("Test update post fail,wrong id", async () => {
        const response = await request(app)
            .put("/posts/" + postId + 5)
            .set({
                authorization: "JWT " + userInfo.token
            })
            .send(updatedPost);

        expect(response.statusCode).not.toBe(200);
    });

    
    test("Test get post by id with invalid id", async () => {
        const invalidId = "invalid_id_123";
        const response = await request(app).get("/posts/" + invalidId);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.any(Object));
    });



    test("Test get post by id with null id", async () => {
        const response = await request(app).get("/posts/null");
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.any(Object));
        expect(response.body.message).toBeDefined();
    });

    test("Test update post by id with invalid id", async () => {
        const invalidId = "invalid_id_123";
        const response = await request(app)
            .put("/posts/" + invalidId)
            .set({
                authorization: "JWT " + userInfo.token
            })
            .send(updatedPost);
    
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.any(Object));
    });

    test("Update post test by diffrent id ", async () => {
        const updatePost = {
            title: "Updated title",
            content: "Updated content",
        };

        const response1 = await request(app).post("/auth/register").send(testUser2);
        expect(response1.statusCode).toBe(200);
        const response2 = await request(app).post("/auth/login").send(testUser2);
        expect(response2.statusCode).toBe(200);
        testUser2.token = response2.body.token;
        testUser2.id = response2.body._id;

            const response = await request(app)
            .put("/posts/" + postId)
            .set({
                authorization: "JWT " + testUser2.token
            })
            .send(updatePost);

        expect(response.statusCode).not.toBe(200);
    });

    test("Test delete post by id", async () => {
        const response = await request(app)
            .delete("/posts/" + postId)
            .set({
                authorization: "JWT " + userInfo.token
            });
        expect(response.statusCode).toBe(200);
    });

    test("Test delete post by id fail", async () => {
        const response = await request(app)
            .delete("/posts/" + postId)
            .set({
                authorization: "JWT " + testUser2.token
            });
        expect(response.statusCode).not.toBe(200);
    });

    test("Test delete post by id fail, wrong id", async () => {
        const response = await request(app)
            .delete("/posts/" + postId + 5)
            .set({
                authorization: "JWT " + userInfo.token
            });
        expect(response.statusCode).not.toBe(200);
    });

    test("Update post with wrong ID format", async () => {
        const updatePst = {
            title: "Updated title",
            content: "Updated content",
        };

        const response = await request(app)
            .put("/posts/" + postId + 5)
            .set({
                authorization: "JWT " + testUser.token
            })
            .send(updatePst);

        expect(response.statusCode).not.toBe(200);
    });

    test("Delete post with wrong ID format", async () => {
        const response = await request(app)
            .delete("/posts/" + postId + 5)
            .set({
                authorization: "JWT " + testUser.token
            });

        expect(response.statusCode).not.toBe(200);
    });

});
