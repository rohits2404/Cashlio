import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Income } from "../models/Income.js";
import { Expense } from "../models/Expense.js";

export const getAllTransaction = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await User.findOne({ clerkId });
        if (!user) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }
        const allIncome = await Income.find({ _id: { $in: user.income } }).sort({ createdAt: -1 });
        const allExpense = await Expense.find({ _id: { $in: user.expenses } }).sort({ createdAt: -1 });
        const allTransactions = [...allIncome, ...allExpense].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).reverse();
        return res.status(200).json({ transactions: allTransactions, message: "All Transactions Fetched Successfully" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}