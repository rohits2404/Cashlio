import mongoose, { Document, Schema } from "mongoose";

export interface IIncome extends Document {
    transactionType: string;
    title: string;
    emoji: string;
    category: string;
    amount: number;
    clerkId: string;
    date: Date;
}

const IncomeSchema = new Schema<IIncome>(
    {
        transactionType: { type: String, required: true },
        title: { type: String, required: true },
        emoji: { type: String, required: true },
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        clerkId: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Income = mongoose.model<IIncome>("Income", IncomeSchema);