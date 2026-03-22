import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { addExpense, deleteExpense, getUserExpense, updateExpense } from "../controllers/expenseController.js";

const expenseRouter = Router();

expenseRouter.post("/add-expense", requireAuth(), addExpense);
expenseRouter.get("/get-expense", requireAuth(), getUserExpense);
expenseRouter.put("/update-expense/:id", requireAuth(), updateExpense);
expenseRouter.delete("/delete-expense/:id", requireAuth(), deleteExpense);

export default expenseRouter;