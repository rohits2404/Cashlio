import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Expense } from "../models/Expense.js";

const validateExpenseFields = (
    title: string,
    emoji: string,
    category: string,
    amount: unknown,
    date: unknown
): boolean => {
    return (
        !title?.trim() ||
        !emoji?.trim() ||
        !category?.trim() ||
        amount === undefined ||
        amount === null ||
        isNaN(Number(amount)) ||
        !date
    );
};

export const addExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, emoji, category, amount, date } = req.body;

        if (validateExpenseFields(title, emoji, category, amount, date)) {
            res.status(400).json({ message: "All Expense Fields are Required" });
            return;
        }

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

        const expense = await Expense.create({
            transactionType: "expense",
            title,
            emoji,
            category,
            amount,
            date,
            clerkId,
        });

        if (!expense) {
            res.status(500).json({ message: "Failed To Add Expense" });
            return;
        }

        user.expenses.push(expense._id);
        await user.save();

        res.status(201).json({ message: "Expense Added Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findOne({ clerkId })
            .lean()
            .populate({ path: "expenses", select: "-__v -clerkId" });

        if (!user) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }

        res.status(200).json({
            expenses: user.expenses,
            message: "User Expense Fetched Successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, emoji, category, amount, date } = req.body;

        if (validateExpenseFields(title, emoji, category, amount, date)) {
            res.status(400).json({ message: "All Expense Fields are Required" });
            return;
        }

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

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, clerkId },
            { $set: { title, emoji, category, date, amount } },
            { new: true }
        );

        if (!updatedExpense) {
            res.status(404).json({ message: "Expense Not Found or Update Failed" });
            return;
        }

        res.status(200).json({ message: "Expense Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

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

        const deletedExpense = await Expense.findOneAndDelete({
            _id: id,
            clerkId,
        });

        if (!deletedExpense) {
            res.status(404).json({ message: "Expense Not Found or Already Deleted" });
            return;
        }

        await User.updateOne({ _id: user._id }, { $pull: { expenses: id } });

        res.status(200).json({ message: "Expense Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};