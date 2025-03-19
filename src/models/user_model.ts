import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  _id?: string;
  refreshTokens: string[];
  posts: mongoose.Schema.Types.ObjectId[]; 
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
    profilePicture: {
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
        ref: "Posts", 
    }]
});

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;