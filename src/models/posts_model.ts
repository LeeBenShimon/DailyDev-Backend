import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  image?: string; // Optional field to store the image path or URL
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true } 
);

const PostModel = mongoose.model<IPost>("Posts", postSchema);
export default PostModel;
