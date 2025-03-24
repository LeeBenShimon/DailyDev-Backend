/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Request, Response } from "express";

jest.mock("../models/user_model");

// Mock console.error to suppress error logs in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

let app: Express;
let accessToken: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany?.({});
  await postsModel.deleteMany?.({});
  await commentsModel.deleteMany?.({});

  const testUserCredentials = {
    email: `test${Math.random().toString(36).substring(2)}@example.com`,
    password: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    username: `testuser${Math.random().toString(36).substring(2)}`
  };

  try {
    const registerRes = await request(app).post("/auth/register").send(testUserCredentials);
    userId = registerRes.body._id;

    const loginRes = await request(app).post("/auth/login").send({
      email: testUserCredentials.email,
      password: testUserCredentials.password
    });
    accessToken = loginRes.body.accessToken;
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise(resolve => setTimeout(resolve, 500));
});



describe("Users Controller Unit Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockRes = {
      json: mockJson,
      status: mockStatus
    };
    mockReq = {};
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return 400 if userId is missing', async () => {
      mockReq.query = {};
      await getUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Missing userId' });
    });

    it('should return user profile when user exists', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        username: 'testuser11111',
        profilePicture: 'test.jpg',
        bio: 'test bio'
      };

      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserProfile(mockReq as Request, mockRes as Response);
      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user is not found', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateUserProfile', () => {
    it('should return 400 if userId is missing', async () => {
      mockReq.query = {};
      mockReq.body = {
        username: 'newuser',
        profilePicture: 'new.jpg',
        bio: 'new bio'
      };

      await updateUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Missing userId' });
    });

    it('should update user profile successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        username: 'newuser',
        profilePicture: 'new.jpg',
        bio: 'new bio'
      };

      mockReq.query = { userId };
      mockReq.body = updateData;

      const mockUpdatedUser = {
        _id: userId,
        ...updateData
      };

      (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      await updateUserProfile(mockReq as Request, mockRes as Response);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 404 when user is not found', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      mockReq.body = {
        username: 'newuser',
        profilePicture: 'new.jpg',
        bio: 'new bio'
      };

      (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await updateUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      mockReq.body = {
        username: 'newuser',
        profilePicture: 'new.jpg',
        bio: 'new bio'
      };

      (userModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await updateUserProfile(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getUserById', () => {
    it('should return 400 if userId is missing', async () => {
      mockReq.query = {};
      await getUserById(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Missing userId' });
    });

    it('should return user when found', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        username: 'testuser',
        profilePicture: 'test.jpg',
        bio: 'test bio'
      };

      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserById(mockReq as Request, mockRes as Response);
      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user is not found', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserById(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockReq.query = { userId };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getUserById(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
