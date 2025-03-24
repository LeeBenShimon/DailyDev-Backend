import mongoose from "mongoose"; // Import mongoose
import postsModel, { IPost } from "../models/posts_model";
import createController from "./base_controller";
import { writeFileSync } from "fs";
// import path from "path";


const postsController = createController<IPost>(postsModel);

postsController.like = async (req, res) => {
    try {
      const post = (await postsModel.findById(req.params.id)) as IPost;
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
  
      const userId = req.body.userId as string;
      if (!userId) {
        res.status(400).json({ message: "Missing userId" });
        return;
      }
  
      if (!post.likes.some((id) => id.toString() === userId)) {
        post.likes.push(new mongoose.Types.ObjectId(userId));
        await post.save();
      }
  
      res.status(200).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  postsController.unlike = async (req, res) => {
    try {
      const post = (await postsModel.findById(req.params.id)) as IPost;
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
  
      const userId = req.body.userId as string;
      if (!userId) {
        res.status(400).json({ message: "Missing userId" });
        return;
      }
  
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      await post.save();
  
      res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Internal server error"});
    }
  };

postsController.getLikes = async (req, res) => {
    try {
        const post = await postsModel.findById(req.params.id).populate("likes", "username profilePicture"); // Corrected field name
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        res.status(200).json(post.likes);
    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

postsController.getComments = async (req, res) => {
    try {
        const comments = await import("../models/comments_model").then(({ default: commentsModel }) =>
            commentsModel.find({ postId: req.params.id }).populate("owner", "username profilePicture")
        );

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

postsController.create = async (req, res) => {
    try{
        let filename = Date.now().toString();
        let imageFile: Express.Multer.File | undefined = undefined;

        if (req.files && "image" in req.files) {
            imageFile = req.files["image"][0] as Express.Multer.File;
            filename = `${filename}.${imageFile.mimetype.split("/")[1]}`

            await writeFileSync(`./storage/${filename}`, imageFile.buffer);
        }

        const doc = new postsModel(req.body);

        if(imageFile) {
            doc.image = filename;
        }
        
        doc.owner = new mongoose.Types.ObjectId(req.query.userId as string);
        await doc.save();

        res.status(201).json(doc);
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default postsController;
