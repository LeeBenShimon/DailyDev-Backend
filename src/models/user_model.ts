import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
    email: string;
    password: string;
    username: string;
    // imgUrl?: string; // Add imgUrl to the interface
    // bio?: string; // Add bio to the interface
    refreshTokens: string[];
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
        unique: true,
    },
    // imgUrl: {
    //     type: String,
    // },
    // bio: {
    //     type: String,
    // },
    refreshTokens: [{
        type: String,
    }]
});

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;