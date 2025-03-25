import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user_model";

export interface IMessage extends Document {
  sender: IUser["_id"];
  receiver: IUser["_id"];
  content: string;
  timestamp: Date;
  chatId: string;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: { type: String, required: true },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
