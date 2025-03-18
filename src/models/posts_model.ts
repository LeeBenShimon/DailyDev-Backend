import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    title: string;
    content: string;
    owner: mongoose.Schema.Types.ObjectId; // ✅ Reference to the User
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // ✅ Reference to the Users model
        required: true
    }
});

const PostModel = mongoose.model<IPost>("Posts", postSchema);
export default PostModel;
