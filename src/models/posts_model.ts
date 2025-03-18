import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    title: string;
    content: string;
    owner: mongoose.Schema.Types.ObjectId; 
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
        ref: "Users", 
        required: true
    }
});

const PostModel = mongoose.model<IPost>("Posts", postSchema);
export default PostModel;
