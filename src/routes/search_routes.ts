import express from "express";
import usersModel from "../models/user_model";
import postsModel from "../models/posts_model";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q as string;

    const users = await usersModel
      .find({
        username: { $regex: q, $options: "i" },
      })
      .limit(5);

    const posts = await postsModel
      .find({
        content: { $regex: q, $options: "i" },
      })
      .limit(5);

    
    const usersWithType = users.map((user) => ({
      ...user.toObject(),
      type: "user",
    }));
    const postsWithType = posts.map((post) => ({
      ...post.toObject(),
      type: "post",
    }));

    res.json([...usersWithType, ...postsWithType]);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;