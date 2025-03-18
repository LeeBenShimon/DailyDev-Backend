import mongoose, { Schema, Document } from "mongoose";

export interface iComment extends Document {
    comment: string;
    owner: mongoose.Schema.Types.ObjectId; 
    postId: mongoose.Schema.Types.ObjectId; 
}

const commentSchema = new Schema<iComment>({
    comment: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", 
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts", 
        required: true
    }
});

const commentModel = mongoose.model<iComment>("Comments", commentSchema);
export default commentModel;
