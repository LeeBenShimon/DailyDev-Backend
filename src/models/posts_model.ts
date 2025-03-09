import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface iPost {
    title: string;
    content: string;
    owner: string;
}

const postSchema = new Schema<iPost>({ 
    title: { 
        type: String, 
        required: true,
    },
    content: String,
    owner: { 
        type: String,  
        required: true
    },
});

const postModel = mongoose.model<iPost>("Posts", postSchema);
export default postModel;