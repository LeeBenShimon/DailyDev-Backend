/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import initApp from '../server';
import mongoose from 'mongoose';
import userModel from '../models/user_model';
import postsModel from '../models/posts_model';
import commentsModel from '../models/comments_model';
import { Express } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserById
} from '../controllers/users_controller';

jest.mock("../models/user_model");

let app: Express;
let accessToken: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany?.({});
  await postsModel.deleteMany?.({});
  await commentsModel.deleteMany?.({});

  const user = {
    email: `user${Date.now()}@example.com`,
    password: "password123",
    username: "testuser"
  };
  const registerRes = await request(app).post("/auth/register").send(user);
  userId = registerRes.body._id;

  const loginRes = await request(app).post("/auth/login").send(user);
  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Users Controller Integration Tests (matching actual routes)", () => {
  test("getUserById - should return user by ID", async () => {
    const res = await request(app).get("/user/getUserById").query({ userId });
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(userId);
  });

  test("updateProfile - should update user profile", async () => {
    const res = await request(app)
      .put("/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "updatedUser", bio: "New bio", avatar: "avatar.jpg" });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("updatedUser");
  });

  test("getUserProfile - should return public user profile", async () => {
    const res = await request(app).get("/user/profile").query({ userId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      username: "updatedUser",
      avatar: "avatar.jpg",
      bio: "New bio"
    });
  });

  test.skip("getUserStats - should return user stats", async () => {
    const res = await request(app).get("/user/stats").query({ userId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ postsCount: 0, commentsCount: 0 });
  });
});

// Reusable mock response
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getUserProfile Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return user profile when user exists", async () => {
    const req: any = { query: { userId: "abc123" } };
    const res = mockResponse();

    (userModel.findById as jest.Mock).mockResolvedValue({ username: "Lee" });

    await getUserProfile(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("abc123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ username: "Lee" });
  });

  test("should return 404 when user is not found", async () => {
    const req: any = { query: { userId: "missing" } };
    const res = mockResponse();

    (userModel.findById as jest.Mock).mockResolvedValue(null);

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("should return 500 on error", async () => {
    const req: any = { query: { userId: "errorUser" } };
    const res = mockResponse();

    (userModel.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("updateUserProfile Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update user profile successfully", async () => {
    const req: any = {
      query: { userId: "abc123" },
      body: {
        name: "Updated User",
        profilePicture: "new-pic.jpg",
        bio: "Updated bio"
      }
    };
    const res = mockResponse();

    const mockSelect = jest.fn().mockResolvedValue({
      _id: "abc123",
      name: "Updated User",
      profilePicture: "new-pic.jpg",
      bio: "Updated bio"
    });

    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ select: mockSelect });

    await updateUserProfile(req, res);

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "abc123",
      {
        name: "Updated User",
        profilePicture: "new-pic.jpg",
        bio: "Updated bio"
      },
      { new: true, runValidators: true }
    );

    expect(res.json).toHaveBeenCalledWith({
      _id: "abc123",
      name: "Updated User",
      profilePicture: "new-pic.jpg",
      bio: "Updated bio"
    });
  });

  test("should return 404 if user not found", async () => {
    const req: any = {
      query: { userId: "notfound" },
      body: { name: "No User", profilePicture: "", bio: "" }
    };
    const res = mockResponse();

    const mockSelect = jest.fn().mockResolvedValue(null);
    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ select: mockSelect });

    await updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("should return 500 on error", async () => {
    const req: any = {
      query: { userId: "abc123" },
      body: { name: "Err User", profilePicture: "", bio: "" }
    };
    const res = mockResponse();

    const mockSelect = jest.fn().mockRejectedValue(new Error("DB error"));
    (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ select: mockSelect });

    await updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("getUserById Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if userId is missing", async () => {
    const req: any = { query: {} };
    const res = mockResponse();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing userId" });
  });

  test("should return 404 if user not found", async () => {
    const req: any = { query: { userId: "notfound" } };
    const res = mockResponse();

    const mockSelect = jest.fn().mockResolvedValue(null);
    (userModel.findById as jest.Mock).mockReturnValue({ select: mockSelect });

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("should return user if found", async () => {
    const req: any = { query: { userId: "abc123" } };
    const res = mockResponse();

    const mockSelect = jest.fn().mockResolvedValue({ _id: "abc123", username: "Lee" });
    (userModel.findById as jest.Mock).mockReturnValue({ select: mockSelect });

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "abc123", username: "Lee" });
  });

  test("should return 500 if DB throws error", async () => {
    const req: any = { query: { userId: "abc123" } };
    const res = mockResponse();

    const mockSelect = jest.fn().mockRejectedValue(new Error("DB error"));
    (userModel.findById as jest.Mock).mockReturnValue({ select: mockSelect });

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
