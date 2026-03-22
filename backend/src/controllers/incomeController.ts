import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Income } from "../models/Income.js";

const validateIncomeFields = (
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

export const addIncome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, emoji, category, amount, date } = req.body;

        if (validateIncomeFields(title, emoji, category, amount, date)) {
            res.status(400).json({ message: "All Income Fields are Required" });
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

        const income = await Income.create({
            transactionType: "income",
            title,
            emoji,
            category,
            amount,
            date,
            clerkId,
        });

        if (!income) {
            res.status(500).json({ message: "Failed To Add Income" });
            return;
        }

        user.income.push(income._id);
        await user.save();

        res.status(201).json({ message: "Income Added Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserIncome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findOne({ clerkId })
            .lean()
            .populate({ path: "income", select: "-__v -clerkId" });

        if (!user) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }

        res.status(200).json({
            incomes: user.income,
            message: "User Income Fetched Successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateIncome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, emoji, category, amount, date } = req.body;

        if (validateIncomeFields(title, emoji, category, amount, date)) {
            res.status(400).json({ message: "All Income Fields are Required" });
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

        const updatedIncome = await Income.findOneAndUpdate(
            { _id: id, clerkId },
            { $set: { title, emoji, category, date, amount } },
            { new: true }
        );

        if (!updatedIncome) {
            res.status(404).json({ message: "Income Not Found or Update Failed" });
            return;
        }

        res.status(200).json({ message: "Income Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteIncome = async (req: Request, res: Response): Promise<void> => {
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

        const deletedIncome = await Income.findOneAndDelete({
            _id: id,
            clerkId,
        });

        if (!deletedIncome) {
            res.status(404).json({ message: "Income Not Found or Already Deleted" });
            return;
        }

        await User.updateOne({ _id: user._id }, { $pull: { income: id } });

        res.status(200).json({ message: "Income Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};