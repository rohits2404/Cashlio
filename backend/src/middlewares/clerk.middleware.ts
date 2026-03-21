import { Webhook, WebhookRequiredHeaders } from "svix";
import { Request, Response } from "express";
import { User } from "../models/User.js";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables");
}

export const clerkWebhookHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const payload = req.body as Buffer;
        const headers = req.headers;

        const svix_id = headers["svix-id"] as string;
        const svix_timestamp = headers["svix-timestamp"] as string;
        const svix_signature = headers["svix-signature"] as string;

        if (!svix_id || !svix_timestamp || !svix_signature) {
            res.status(400).json({ error: "Missing Svix headers" });
            return;
        }

        const wh = new Webhook(webhookSecret as string);

        const svixHeaders: WebhookRequiredHeaders = {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        };

        const evt = wh.verify(payload, svixHeaders) as {
            type: string;
            data: {
                id: string;
                email_addresses?: { email_address: string }[];
                first_name?: string;
                last_name?: string;
                image_url?: string;
            };
        };

        const { type: eventType, data } = evt;

        // ✅ Combine first and last name into fullName
        const fullName = [data.first_name, data.last_name]
            .filter(Boolean)
            .join(" ") || undefined;

        console.log("📩 Clerk Event:", eventType);

        switch (eventType) {
            case "user.created":
                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        $set: {
                            clerkId: data.id,
                            email: data.email_addresses?.[0]?.email_address ?? "",
                            fullName,
                            imageUrl: data.image_url,
                        },
                    },
                    { upsert: true, new: true }
                );
                break;

            case "user.updated":
                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        $set: {
                            email: data.email_addresses?.[0]?.email_address ?? "",
                            fullName,
                            imageUrl: data.image_url,
                        },
                    },
                    { new: true }
                );
                break;

            case "user.deleted":
                await User.findOneAndDelete({ clerkId: data.id });
                break;

            default:
                console.log("Unhandled Event:", eventType);
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Webhook Error:", err);
        res.status(400).json({ error: "Webhook Verification Failed" });
    }
};