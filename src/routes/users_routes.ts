import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/users_controller"; // Import profile controller
import { authMiddleware } from "../controllers/auth_controller"; // Authentication middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User Profile Management
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile of the currently authenticated user.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user's ID.
 *                 email:
 *                   type: string
 *                   description: The user's email.
 *                 username:
 *                   type: string
 *                   description: The user's username.
 *                 avatar:
 *                   type: string
 *                   description: The user's avatar URL (optional).
 *                 bio:
 *                   type: string
 *                   description: The user's bio (optional).
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of post IDs associated with the user.
 *       401:
 *         description: Unauthorized, missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.get("/", authMiddleware, getUserProfile); // Matches "/user/profile"
router.get("/getUserById", getUserProfile); // this supports ?userId=

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information (e.g., bio).
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 description: The new bio for the user.
 *                 example: "I am a software developer learning new skills!"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       400:
 *         description: Bad request, missing required fields.
 *       401:
 *         description: Unauthorized, missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.put("/", authMiddleware, updateUserProfile); // Matches "/user/profile"

export default router;
