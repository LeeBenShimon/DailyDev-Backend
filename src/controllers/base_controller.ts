import { Request, Response } from "express";
import { Model } from "mongoose";
import PostModel from "../models/posts_model";
import userModel from "../models/user_model";

class BaseController<T> {
    model: Model<T>;
    constructor(model: Model<T>){
        this.model = model;
    }

    async create(req: Request, res: Response): Promise<void>{
        try {
            const { title, content } = req.body;
            const userId = req.query.userId; // ✅ Extracted from auth middleware
    
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
    
            // ✅ Create new post
            const newPost = await PostModel.create({ title, content, owner: userId });
    
            // ✅ Add the post reference to the user
            await userModel.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
    
            res.status(201).json(newPost);
        } catch (error) {
            console.error("Error creating post:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
    

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            let filter: Partial<T> = {};
    
            // ✅ Ensure `owner` is a valid string before adding it to the filter
            if (req.query.owner && typeof req.query.owner === "string") {
                filter = { ...filter, owner: req.query.owner } as Partial<T>;
            }
    
            const data = await this.model.find(filter);
            res.status(200).send(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send({
                    status: "error",
                    message: error.message
                });
            } else {
                res.status(400).send({
                    status: "error",
                    message: "An unknown error occurred"
                });
            }
        }
    }
    
    

    async getById(req:Request, res:Response): Promise<void> {
        const id = req.params.id;
        try {
            const item = await this.model.findById(id);
            if (!item) {
                res.status(404).send({
                    status: "error",
                    message: "Resource not found"
                });
                return;
            }
            res.status(200).send(item);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name === 'CastError') {
                    res.status(400).send({
                        status: "error",
                        message: "Invalid ID format"
                    });
                    return;
                }
                res.status(400).send({
                    status: "error",
                    message: error.message
                });
            } else {
                res.status(400).send({
                    status: "error",
                    message: "An unknown error occurred"
                });
            }
        }
    }

    async getPostId(req:Request, res:Response): Promise<void> {
        const postId = req.query.postId;
        try {
            if (!postId) {
                res.status(400).send({
                    status: "error",
                    message: "PostId is required"
                });
                return;
            }
            const comments = await this.model.find({postId: postId});
            res.status(200).send(comments);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send({
                    status: "error",
                    message: error.message
                });
            } else {
                res.status(400).send({
                    status: "error",
                    message: "An unknown error occurred"
                });
            }
        }
    }

    async deleteById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
            const exists = await this.model.findById(id);
            if (!exists) {
                res.status(404).send({ 
                    status: "error",
                    message: "Resource not found" 
                });
                return;
            }

            const data = await this.model.findByIdAndDelete(id);
            res.status(200).send({
                status: "success",
                message: "Resource deleted successfully",
                data: data
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name === 'CastError') {
                    res.status(400).send({
                        status: "error",
                        message: "Invalid ID format"
                    });
                    return;
                }
                res.status(500).send({
                    status: "error",
                    message: "Internal server error",
                    error: error.message
                });
            } else {
                res.status(500).send({
                    status: "error",
                    message: "An unknown error occurred"
                });
            }
        }
    }

    async updateById(req:Request, res:Response): Promise<void> {
        const id = req.params.id;
        const updateData = req.body;
        try {
            const exists = await this.model.findById(id);
            if (!exists) {
                res.status(404).send({
                    status: "error",
                    message: "Resource not found"
                });
                return;
            }

            const update = await this.model.findByIdAndUpdate(
                id,
                updateData,
                {new: true, runValidators: true}
            );

            res.status(200).send({
                status: "success",
                message: "Resource updated successfully",
                data: update
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name === 'CastError') {
                    res.status(400).send({
                        status: "error",
                        message: "Invalid ID format"
                    });
                    return;
                } else if (error.name === 'ValidationError') {
                    res.status(400).send({
                        status: "error",
                        message: "Validation error",
                        error: error.message
                    });
                    return;
                }
                res.status(500).send({
                    status: "error",
                    message: "Internal server error",
                    error: error.message
                });
            } else {
                res.status(500).send({
                    status: "error",
                    message: "An unknown error occurred"
                });
            }
        }
    }
}

const createController = <T>(model: Model<T>) => {
    return new BaseController(model);
};
export default createController;
