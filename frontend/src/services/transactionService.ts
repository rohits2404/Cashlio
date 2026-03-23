import { APP_API_URL } from "@/constants";
import { ITransactionData } from "@/types";
import axios from "axios";

const createAxiosInstance = (token: string) => axios.create({
    baseURL: `${APP_API_URL}/api/transaction`,
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});

export const fetchAllTransaction = async (token: string): Promise<ITransactionData[]> => {
    try {
        const response = await createAxiosInstance(token).get("/get-all-transactions");
        return response?.data?.transactions;
    } catch (error) {
        console.error(error);
        throw error;
    }
};