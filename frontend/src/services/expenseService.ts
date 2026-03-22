import { APP_API_URL } from "@/constants";
import { ITransactionData } from "@/types";
import axios from "axios";

const createAxiosInstance = (token: string) =>
    axios.create({
        baseURL: `${APP_API_URL}/api/expense`,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const addExpense = async (
    payload: ITransactionData,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).post("/add-expense", payload);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchExpense = async (token: string): Promise<ITransactionData[]> => {
    try {
        const response = await createAxiosInstance(token).get("/get-expense");
        return response?.data?.expenses;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateExpense = async (
    payload: ITransactionData,
    id: string,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).put(`/update-expense/${id}`, payload);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteExpense = async (
    id: string,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).delete(`/delete-expense/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};