import express from 'express';
import authController from '../controllers/auth_controller';
import { authMiddleware } from '../controllers/auth_controller';


const router = express.Router();

/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - password
*       properties:
*         email:
*           type: string
*           description: The user email
*         password:
*           type: string
*           description: The user password
*       example:
*         email: 'bob@gmail.com'
*         password: '123456'
*/

/**
* @swagger
* /auth/register:
*   post:
*     summary: Registers a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: Registration success, returns the new user
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*/
router.post("/register", authController.register);
router.post('/googleSignIn', authController.googleSignIn);

/**
* @swagger
* /auth/login:
*   post:
*     summary: Authenticate a user and return access and refresh tokens.
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: Successful login
*         content:
*           application/json:
*               schema:
*                   type: object
*                   properties:
*                       accessToken:
*                           type: string
*                           description: JWT access token
*                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*                       refreshToken:
*                           type: string
*                           description: JWT refresh token
*                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*                       _id:
*                           type: string
*                           description: User ID
*                           example: "60d0fe4f5311236168a109ca"
*       '400':
*         description: Invalid email or password
*       '500':
*         description: Internal server error
*/
router.post("/login", authController.login);

/**
* @swagger
* /auth/logout:
*   post:
*     summary: Logs out the user by invalidating all refresh tokens.
*     tags: [Auth]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Successfully logged out
*       '401':
*         description: Unauthorized
*       '500':
*         description: Internal server error
*/
router.post("/logout", authMiddleware, authController.logout);

/**
* @swagger
* /auth/refresh:
*   post:
*     summary: Refreshes the access token using a valid refresh token.
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               refreshToken:
*                 type: string
*                 description: The refresh token
*                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*     responses:
*       200:
*         description: Returns a new access token
*         content:
*           application/json:
*               schema:
*                   type: object
*                   properties:
*                       accessToken:
*                           type: string
*                           description: JWT access token
*                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*                       refreshToken:
*                           type: string
*                           description: New JWT refresh token
*                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*       '401':
*         description: Unauthorized
*       '403':
*         description: Invalid refresh token
*       '500':
*         description: Internal server error
*/
router.post("/refresh", authController.refresh);


export default router;
