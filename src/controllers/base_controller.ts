/* eslint-disable @typescript-eslint/no-explicit-any */
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
      const filter: FilterQuery<T> = {} as FilterQuery<T> &
        Record<string, unknown>;

      if (typeof req.query.owner === "string") {
        (filter as Record<string, unknown>).owner = req.query.owner;
      }

      if (typeof req.query.postId === "string") {
        (filter as Record<string, unknown>).postId = req.query.postId;
      }

      const data = await this.model
        .find(filter)
        .populate("owner", "username profilePicture"); 

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

      const updatedItem = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
        message: "Resource updated successfully",
        data: updatedItem,
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

      if (this.model.modelName === "Posts") {
        import("../models/comments_model").then(
          ({ default: commentsModel }) => {
            commentsModel.deleteMany({ postId: id }).catch(console.error);
          }
        );
      }

      res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Optional methods for specific controllers
  like?: (req: Request, res: Response) => Promise<void>;
  unlike?: (req: Request, res: Response) => Promise<void>;
  getLikes?: (req: Request, res: Response) => Promise<void>; // Add getLikes
  getComments?: (req: Request, res: Response) => Promise<void>; // Add getComments
}

const createController = <T extends Document>(
  model: Model<T>
): BaseController<T> => {
  return new BaseController(model);
};

export default createController;
