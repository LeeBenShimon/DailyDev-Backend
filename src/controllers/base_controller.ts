import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;
    constructor(model: Model<T>){
        this.model = model;
    }

    async create(req:Request, res:Response): Promise<void> {
        try{
            const comment = await this.model.create(req.body);
            res.status(201).send(comment);
        }catch (error: unknown){
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

    async getAll(req: Request, res: Response): Promise<void> {
        const filter = { ...req.query };
        delete filter.userId;
        try {
            const data = await this.model.find(filter as Partial<T>);
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
