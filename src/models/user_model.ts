import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  _id?: string;
  refreshTokens: string[];
  posts: mongoose.Schema.Types.ObjectId[]; // ✅ Array of post references
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
    },
    bio: {
        type: String,
    },
    refreshTokens: [{
        type: String,
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts", // ✅ Reference to the Posts model
    }]
});

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;