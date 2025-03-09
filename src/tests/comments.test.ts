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
    token?: string,
    _id?: string
};
const userInfo: UserInfo = {
    email: "leebenshimon14@gmail.com",
    password: "123456"
}

beforeAll(async () => {
    app = await initApp();
    await commentsModel.deleteMany();
    await userModel.deleteMany();
    await request(app).post("/auth/register").send(userInfo);
    const response = await request(app).post("/auth/login").send(userInfo);
    userInfo.token = response.body.accessToken;
    userInfo._id = response.body._id;
});

afterAll(async () => {
    console.log('afterAll');
    await mongoose.connection.close();
});

let postId = "";
const testComment = {
    comment: "Test comment",
    postId: "First Test",
    owner: "Lee",
  }
const invalidComment = {
    content: "Test comment",
};
const updatedComment = {
    comment: "Updated comment",
};

describe("Comments test suite", () => {
    test("Comment test get all", async () => {
       const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    test("Test Create Comment", async () => {
        const response = await request(app).post("/comments").set({
            authorization: "JWT " + userInfo.token,
        }).send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.owner).toBe(testComment.owner);
        expect(response.body.comment).toBe(testComment.comment);
        postId = response.body._id;
        });

    test("Test Create invalid comment", async () => {
        const response = await request(app).post("/comments").send(invalidComment);
        expect(response.statusCode).not.toBe(201);
    });


    test("Post test get all comments after adding", async () => {
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test get comment by owner", async () => {
            const response = await request(app).get("/comments?owner=" + testComment.owner);
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].owner).toBe(testComment.owner);
        });
    
    test("Test get comment by id", async () => {
        const response = await request(app).get("/comments/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });

    test("Test get comments by fail id-1", async () => {
        const response = await request(app).get("/comments/" + postId + 5);
        expect(response.statusCode).toBe(400);
    });

    test("Test get comments by fail id-2", async () => {
        const response = await request(app).get("/comments/f242f1b06026b3201f8");
        expect(response.statusCode).toBe(400);
    });

    test("Test get comment by id fail", async () => {
        const response = await request(app).get("/comments/6667196fe022c25f3ab887fc");
        expect(response.statusCode).toBe(200);
    });

    test("Test update post by id", async () => {
            const response = await request(app)
                .put("/comments/" + postId)
                .set({
                    authorization: "JWT " + userInfo.token
                })
                .send(updatedComment);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.comment).toBe(updatedComment.comment);
        });
    
        test("Test update post fail,wrong id", async () => {
            const response = await request(app)
                .put("/comments/" + postId + 5)
                .set({
                    authorization: "JWT " + userInfo.token
                })
                .send(updatedComment);
    
            expect(response.statusCode).not.toBe(200);
        });

        /////////////////////////////

        test("Test update post fail, no token", async () => {
            const response = await request(app)
                .put("/comments/" + postId)
                .send(updatedComment);
    
            expect(response.statusCode).not.toBe(200);
        });

        test("Test update post fail, wrong token", async () => {
            const response = await request(app)
                .put("/comments/" + postId)
                .set({
                    authorization: "JWT " + userInfo.token + 1
                })
                .send(updatedComment);
    
            expect(response.statusCode).not.toBe(200);
        });

        test("Should return 400 status code when deleting a non-existent comment", async () => {
            const nonExistentId = "5f9f1b9b9b9b9b9b9b9b9b9b"; // A valid MongoDB ObjectId that doesn't exist
            const response = await request(app)
                .delete("/comments/" + nonExistentId)
                .set({
                    authorization: "JWT " + userInfo.token
                });
            expect(response.statusCode).toBe(400);
        });

        test("Should return 401 status code when deleting without authentication", async () => {
            const response = await request(app).delete("/comments/" + postId);
            expect(response.statusCode).toBe(401);
        });

});
