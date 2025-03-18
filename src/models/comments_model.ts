import mongoose, { Schema, Document } from "mongoose";

export interface iComment extends Document {
    comment: string;
    owner: mongoose.Schema.Types.ObjectId; // ✅ Reference to the User model
    postId: mongoose.Schema.Types.ObjectId; // ✅ Reference to the Post model
}

const commentSchema = new Schema<iComment>({
    comment: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // ✅ Reference to Users collection
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts", // ✅ Reference to Posts collection
        required: true
    }
});

const commentModel = mongoose.model<iComment>("Comments", commentSchema);
export default commentModel;
