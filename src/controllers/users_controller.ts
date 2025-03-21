import { Request, Response } from "express";
import userModel from "../models/user_model";


// Get User Profile

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
  
// await User.findById(id);
// Update User Profile
const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId;
    const { name, avatar, bio } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, avatar, bio },
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

// ✅ Export the functions properly
export { getUserProfile, updateUserProfile };