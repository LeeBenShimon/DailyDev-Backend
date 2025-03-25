import express from "express";
import { getChatMessages } from "../controllers/message_controller";

const router = express.Router();

router.get("/:chatId", getChatMessages);

export default router;
