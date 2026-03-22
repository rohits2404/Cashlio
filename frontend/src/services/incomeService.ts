import { APP_API_URL } from "@/constants";
import { ITransactionData } from "@/types";
import axios from "axios";

const createAxiosInstance = (token: string) =>
    axios.create({
        baseURL: `${APP_API_URL}/api/income`,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const addIncome = async (
    payload: ITransactionData,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).post("/add-income", payload);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchIncome = async (token: string): Promise<ITransactionData[]> => {
    try {
        const response = await createAxiosInstance(token).get("/get-income");
        return response?.data?.incomes;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateIncome = async (
    payload: ITransactionData,
    id: string,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).put(`/update-income/${id}`, payload);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteIncome = async (
    id: string,
    token: string
): Promise<void> => {
    try {
        await createAxiosInstance(token).delete(`/delete-income/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};