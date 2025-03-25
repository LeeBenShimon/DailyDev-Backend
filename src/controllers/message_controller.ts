import { Request, Response } from "express";
import Message from "../models/messages_model";

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    res.status(200).json(messages);
  } catch (error) {
    console.error(" Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
