import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./middlewares/clerk.middleware.js";

connectDB();

const app = express();

app.use(cors());

app.use("/webhooks/clerk", bodyParser.raw({ type: "application/json" }));
app.post("/webhooks/clerk", clerkWebhookHandler);

app.use(express.json());
app.use(clerkMiddleware());

const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
    res.send("Server Is Live!");
});

app.listen(port, () => {
    console.log(`Server Is Running at http://localhost:${port}`);
});

export default app;