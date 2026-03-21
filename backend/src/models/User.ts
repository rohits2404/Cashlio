import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    fullName?: string;
    imageUrl?: string;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        fullName: String,
        imageUrl: String,
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);