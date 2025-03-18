import { Request, Response } from "express";
import commentsModel, { iComment } from "../models/comments_model";
import createController from "./base_controller";
import postsModel from "../models/posts_model";
import mongoose from "mongoose";

// ✅ Create base controller instance
const commentsController = createController<iComment>(commentsModel);

/**
 * ✅ Override `create()` to add custom validation
 */
commentsController.create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, comment } = req.body;
        const userId = req.query.userId as string;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User ID missing" });
            return;
        }

        if (!postId || !comment) {
            res.status(400).json({ message: "Post ID and comment are required" });
            return;
        }

        // ✅ Validate if the post exists
        const postExists = await postsModel.findById(postId);
        if (!postExists) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const newComment = await commentsModel.create({
            comment,
            owner: new mongoose.Types.ObjectId(userId),
            postId: new mongoose.Types.ObjectId(postId),
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default commentsController;
