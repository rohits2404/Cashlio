import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { addIncome, deleteIncome, getUserIncome, updateIncome } from "../controllers/incomeController.js";

const incomeRouter = Router();

incomeRouter.post("/add-income", requireAuth(), addIncome);
incomeRouter.get("/get-income", requireAuth(), getUserIncome);
incomeRouter.put("/update-income/:id", requireAuth(), updateIncome);
incomeRouter.delete("/delete-income/:id", requireAuth(), deleteIncome);

export default incomeRouter;