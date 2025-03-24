import { Request, Response } from "express";
import userModel from "../models/user_model";




const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.query.userId;
        const user = await userModel.findById(userId) as string;

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
  

const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId;
    const { name, profilePicture, bio } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, profilePicture, bio },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET user profile by userId (from query param)
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    const user = await userModel
      .findById(userId)
      .select("-password -refreshToken");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error"});
}
};


export { getUserProfile, updateUserProfile, getUserById };