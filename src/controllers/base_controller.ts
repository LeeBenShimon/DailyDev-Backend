import { Request, Response } from "express";
import { Model, Document, FilterQuery } from "mongoose";


class BaseController<T extends Document> {
    model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.userId as string;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized: User ID missing" });
                return;
            }

            const newItem = await this.model.create({ ...req.body, owner: userId });
            res.status(201).json(newItem);
        } catch (error) {
            console.error("Error creating item:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filter: FilterQuery<T> = {} as FilterQuery<T> & Record<string, unknown>;

            if (typeof req.query.owner === "string") {
                (filter as Record<string, unknown>).owner = req.query.owner;
            }

            if (typeof req.query.postId === "string") {
                (filter as Record<string, unknown>).postId = req.query.postId;
            }

            const data = await this.model.find(filter);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching items:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.findById(req.params.id);
            if (!item) {
                res.status(404).json({ message: "Item not found" });
                return;
            }
            res.status(200).json(item);
        } catch (error) {
            console.error("Error fetching item:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const updateData = req.body;

            const exists = await this.model.findById(id);
            if (!exists) {
                res.status(404).json({ message: "Resource not found" });
                return;
            }

            const userId = req.query.userId as string;
            if (!userId || (exists as any).owner.toString() !== userId) {
                res.status(403).json({ message: "Forbidden: Not your item" });
                return;
            }

            const updatedItem = await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

            res.status(200).json({
                status: "success",
                message: "Resource updated successfully",
                data: updatedItem
            });
        } catch (error) {
            console.error("Error updating item:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const exists = await this.model.findById(id);
            if (!exists) {
                res.status(404).json({ message: "Resource not found" });
                return;
            }

            const userId = req.query.userId as string;
            if (!userId || (exists as any).owner.toString() !== userId) {
                res.status(403).json({ message: "Forbidden: Not your item" });
                return;
            }

            await this.model.findByIdAndDelete(id);

            // ✅ If deleting a post, delete associated comments
            if (this.model.modelName === "Posts") {
                import("../models/comments_model").then(({ default: commentsModel }) => {
                    commentsModel.deleteMany({ postId: id }).catch(console.error);
                });
            }

            res.status(200).json({ message: "Resource deleted successfully" });
        } catch (error) {
            console.error("Error deleting item:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * Factory function to create a new controller instance
 */
const createController = <T extends Document>(model: Model<T>) => {
    return new BaseController(model);
};

export default createController;







// import { Request, Response } from "express";
// import { Model } from "mongoose";
// import PostModel from "../models/posts_model";
// import userModel from "../models/user_model";

// class BaseController<T> {
//     model: Model<T>;
//     constructor(model: Model<T>){
//         this.model = model;
//     }

//     async create(req: Request, res: Response): Promise<void>{
//         try {
//             const { title, content } = req.body;
//             const userId = req.query.userId; // ✅ Extracted from auth middleware
    
//             if (!userId) {
//                 res.status(400).json({ message: "User ID is required" });
//                 return;
//             }
    
//             // ✅ Create new post
//             const newPost = await PostModel.create({ title, content, owner: userId });
    
//             // ✅ Add the post reference to the user
//             await userModel.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
    
//             res.status(201).json(newPost);
//         } catch (error) {
//             console.error("Error creating post:", error);
//             res.status(500).json({ message: "Internal server error" });
//         }
//     };
    

//     async getAll(req: Request, res: Response): Promise<void> {
//         try {
//             let filter: Partial<T> = {};
    
//             // ✅ Ensure `owner` is a valid string before adding it to the filter
//             if (req.query.owner && typeof req.query.owner === "string") {
//                 filter = { ...filter, owner: req.query.owner } as Partial<T>;
//             }
    
//             const data = await this.model.find(filter);
//             res.status(200).send(data);
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 res.status(400).send({
//                     status: "error",
//                     message: error.message
//                 });
//             } else {
//                 res.status(400).send({
//                     status: "error",
//                     message: "An unknown error occurred"
//                 });
//             }
//         }
//     }
    
    

//     async getById(req:Request, res:Response): Promise<void> {
//         const id = req.params.id;
//         try {
//             const item = await this.model.findById(id);
//             if (!item) {
//                 res.status(404).send({
//                     status: "error",
//                     message: "Resource not found"
//                 });
//                 return;
//             }
//             res.status(200).send(item);
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 if (error.name === 'CastError') {
//                     res.status(400).send({
//                         status: "error",
//                         message: "Invalid ID format"
//                     });
//                     return;
//                 }
//                 res.status(400).send({
//                     status: "error",
//                     message: error.message
//                 });
//             } else {
//                 res.status(400).send({
//                     status: "error",
//                     message: "An unknown error occurred"
//                 });
//             }
//         }
//     }

//     async getPostId(req:Request, res:Response): Promise<void> {
//         const postId = req.query.postId;
//         try {
//             if (!postId) {
//                 res.status(400).send({
//                     status: "error",
//                     message: "PostId is required"
//                 });
//                 return;
//             }
//             const comments = await this.model.find({postId: postId});
//             res.status(200).send(comments);
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 res.status(400).send({
//                     status: "error",
//                     message: error.message
//                 });
//             } else {
//                 res.status(400).send({
//                     status: "error",
//                     message: "An unknown error occurred"
//                 });
//             }
//         }
//     }

//     async deleteById(req: Request, res: Response): Promise<void> {
//         const id = req.params.id;
//         try {
//             const exists = await this.model.findById(id);
//             if (!exists) {
//                 res.status(404).send({ 
//                     status: "error",
//                     message: "Resource not found" 
//                 });
//                 return;
//             }

//             const data = await this.model.findByIdAndDelete(id);
//             res.status(200).send({
//                 status: "success",
//                 message: "Resource deleted successfully",
//                 data: data
//             });
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 if (error.name === 'CastError') {
//                     res.status(400).send({
//                         status: "error",
//                         message: "Invalid ID format"
//                     });
//                     return;
//                 }
//                 res.status(500).send({
//                     status: "error",
//                     message: "Internal server error",
//                     error: error.message
//                 });
//             } else {
//                 res.status(500).send({
//                     status: "error",
//                     message: "An unknown error occurred"
//                 });
//             }
//         }
//     }

//     async updateById(req:Request, res:Response): Promise<void> {
//         const id = req.params.id;
//         const updateData = req.body;
//         try {
//             const exists = await this.model.findById(id);
//             if (!exists) {
//                 res.status(404).send({
//                     status: "error",
//                     message: "Resource not found"
//                 });
//                 return;
//             }

//             const update = await this.model.findByIdAndUpdate(
//                 id,
//                 updateData,
//                 {new: true, runValidators: true}
//             );

//             res.status(200).send({
//                 status: "success",
//                 message: "Resource updated successfully",
//                 data: update
//             });
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 if (error.name === 'CastError') {
//                     res.status(400).send({
//                         status: "error",
//                         message: "Invalid ID format"
//                     });
//                     return;
//                 } else if (error.name === 'ValidationError') {
//                     res.status(400).send({
//                         status: "error",
//                         message: "Validation error",
//                         error: error.message
//                     });
//                     return;
//                 }
//                 res.status(500).send({
//                     status: "error",
//                     message: "Internal server error",
//                     error: error.message
//                 });
//             } else {
//                 res.status(500).send({
//                     status: "error",
//                     message: "An unknown error occurred"
//                 });
//             }
//         }
//     }
// }

// const createController = <T>(model: Model<T>) => {
//     return new BaseController(model);
// };
// export default createController;
