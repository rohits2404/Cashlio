import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    fullName?: string;
    imageUrl?: string;
    expenses: Types.ObjectId[];
    income: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        fullName: String,
        imageUrl: String,
        expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
        income: [{ type: mongoose.Schema.Types.ObjectId, ref: "Income" }],
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);