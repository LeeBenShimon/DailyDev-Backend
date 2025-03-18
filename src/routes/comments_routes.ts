import express from "express";
import { authMiddleware } from "../controllers/auth_controller";
import commentsController from "../controllers/comments_controller";

const router = express.Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 */
router.get("/", authMiddleware, commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 */
router.get("/:id", authMiddleware, commentsController.get.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a comment
 */
router.post("/", authMiddleware, commentsController.create.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 */
router.put("/:id", authMiddleware, commentsController.update.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 */
router.delete("/:id", authMiddleware, commentsController.delete.bind(commentsController));

export default router;



// import express from 'express';
// const router = express.Router();
// import commentsController from '../controllers/comments_controller';
// import { authMiddleware } from '../controllers/auth_controller';

// /**
// * @swagger
// * tags:
// *   name: Comments
// *   description: The Comments API
// */
// /**
// * @swagger
// * /comments:
// *   get:
// *     summary: Get all comments
// *     description: Retrieve all comments
// *     tags: [Comments]
// *     security:
// *       - bearerAuth: []
// *     responses:
// *       200:
// *         description: Comments retrieved successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: array
// *               items:
// *                 type: object
// *                 properties:
// *                   comment:
// *                     type: string
// *                   owner:
// *                     type: string
// *                   postId:
// *                     type: string
// *                   _id:
// *                     type: string
// *       500:
// *         description: Internal server error
// */
// router.get("/", authMiddleware, commentsController.getAll.bind(commentsController));
// /**
// * @swagger
// * /comments/{id}:
// *   get:
// *     summary: Get a comment by ID
// *     description: Retrieve a comment by its ID
// *     tags: [Comments]
// *     security:
// *       - bearerAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         schema:
// *           type: string
// *         required: true
// *         description: The ID of the comment to retrieve
// *     responses:
// *       200:
// *         description: Comment retrieved successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 comment:
// *                   type: string
// *                 owner:
// *                   type: string
// *                 postId:
// *                   type: string
// *                 _id:
// *                   type: string
// *       404:
// *         description: Comment not found
// *       500:
// *         description: Internal server error
// */
// router.get("/:id", authMiddleware, commentsController.get.bind(commentsController));
// /**
// * @swagger
// * /comments:
// *   post:
// *     summary: add a new comment
// *     tags: [Comments]
// *     security:
// *       - bearerAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *               type: object
// *               properties:
// *                       comment:
// *                           type: string
// *                           description: the comment details
// *                           example: "My first comment"
// *                       owner:
// *                           type: string
// *                           description: the comment owner
// *                           example: "yoni24234432 ....."
// *                       postId:
// *                           type: string
// *                           description: the post you want to comment on
// *                           example: "4F58D22D8F56D"
// *     responses:
// *       200:
// *         description: The comment was successfully created
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                       comment:
// *                           type: string
// *                           description: the comment content
// *                           example: "My first comment"
// *                       owner:
// *                           type: string
// *                           description: the comment owner
// *                           example: "This is my first post ....."
// *                       postId:
// *                           type: string
// *                           description: the comment owner
// *                           example: "60f3b4b3b3b3b3b3b3b3b3b3"
// *                       _id:
// *                           type: string
// *                           description: the comment id
// *                           example: "60f3b4b3b3b3b3b3b3b3b3"
// */
// router.post("/", authMiddleware, commentsController.create.bind(commentsController));
// /**
// * @swagger
// * /comments/{id}:
// *   put:
// *     summary: Update a comment
// *     description: Update a comment by its ID
// *     tags: [Comments]
// *     security:
// *       - bearerAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         schema:
// *           type: string
// *         required: true
// *         description: The ID of the comment to update
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             properties:
// *               content:
// *                 type: string
// *                 description: The content of the comment
// *     responses:
// *       200:
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                       comment:
// *                           type: string
// *                           description: the comment content
// *                           example: "My first comment"
// *                       owner:
// *                           type: string
// *                           description: the comment owner
// *                           example: "This is my first post ....."
// *                       postId:
// *                           type: string
// *                           description: the comment owner
// *                           example: "60f3b4b3b3b3b3b3b3b3b3b3"
// *                       _id:
// *                           type: string
// *                           description: the comment id
// *                           example: "60f3b4b3b3b3b3b3b3b3b3"
// *       401:
// *         description: Post not found
// *       500:
// *         description: Internal server error
// */
// router.put("/:id", authMiddleware, (req, res) => {
//     commentsController.update(req, res);
// });
// /**
// * @swagger
// * /comments/{id}:
// *   delete:
// *     summary: Delete a comment
// *     description: Delete a comment by its ID
// *     tags: [Comments]
// *     security:
// *       - bearerAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         schema:
// *           type: string
// *         required: true
// *         description: The ID of the comment to delete
// *     responses:
// *       200:
// *         description: The comment was deleted successfully
// *       400:
// *         description: Invalid ID supplied
// *       404:
// *         description: Comment not found
// *       500:
// *         description: Internal server error
// */
// router.delete("/:id", authMiddleware, commentsController.delete.bind(commentsController));

// export default router;