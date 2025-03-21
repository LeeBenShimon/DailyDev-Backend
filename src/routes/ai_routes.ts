import express from "express";
import { aiController } from "../controllers/ai_controller";

const router = express.Router();

/**
 * @swagger
 * /api/ai/ask:
 *   post:
 *     summary: Ask Gemini AI a question
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "תן לי טיפ ללימוד אלגוריתמים"
 *     responses:
 *       200:
 *         description: Gemini response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *       400:
 *         description: Missing prompt
 *       500:
 *         description: Gemini error
 */
router.post("/ask", aiController.askGemini);

export default router;
