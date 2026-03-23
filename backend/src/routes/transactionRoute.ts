import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { getAllTransaction } from "../controllers/transactionController.js";

const transactionRouter = Router();

transactionRouter.get("/get-all-transactions", requireAuth(), getAllTransaction);

export default transactionRouter;