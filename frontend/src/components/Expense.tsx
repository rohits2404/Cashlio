"use client"

import { PlusIcon, SquarePenIcon, Trash2Icon, TrendingDownIcon } from "lucide-react"
import { ExpenseModal } from "./ExpenseModal"
import { useAuth } from "@clerk/nextjs"
import { addExpense, deleteExpense, fetchExpense, updateExpense } from "@/services/expenseService"
import { IChartSeriesPoint, ITransactionData } from "@/types"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { fetchTransactionsList, getChartOptions } from "@/helpers"
import { EXPENSE_CATEGORY_CONSTANTS } from "@/constants"

const getCategoryTitle = (value: string) => {
    return EXPENSE_CATEGORY_CONSTANTS.find(item => item.value === value)?.title || value;
};

export const Expense = () => {

    const [loading, setLoading] = useState(false);
    const [expenseList, setExpenseList] = useState<ITransactionData[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<ITransactionData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const { getToken, isLoaded } = useAuth();

    const handleFetchUserExpense = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;
            const list = await fetchExpense(token);
            setExpenseList(list);
            const { newCategories = [], newSeriesData = [] } = fetchTransactionsList(list)
            setSeriesData(newSeriesData);
            setCategories(newCategories);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (expenseObj: ITransactionData) => {
        try {
            const token = await getToken();
            if (!token) return;
            // ✅ Removed incorrect optimistic update
            await addExpense(expenseObj, token);
            await handleFetchUserExpense();
            toast.success("Expense Added Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Add Expense");
        }
    }

    const handleUpdateExpense = async (expense: ITransactionData) => {
        try {
            const token = await getToken();
            if (!expense?._id || !token) return;
            await updateExpense(expense, expense._id, token);
            await handleFetchUserExpense();
            toast.success("Expense Updated Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Update Expense");
        }
    }

    const handleDeleteExpense = async (id: string) => {
        try {
            const token = await getToken();
            if (!token) return;
            await deleteExpense(id, token);
            await handleFetchUserExpense();
            toast.success("Expense Deleted Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Delete Expense");
        }
    }

    // ✅ Reset selectedExpense when modal closes so Add mode works fresh
    const handleModalOpenChange = (open: boolean) => {
        setModalOpen(open);
        if (!open) setSelectedExpense(null);
    };

    useEffect(() => {
        if (!isLoaded) return;
        handleFetchUserExpense();
    }, [isLoaded]);

    const options: Highcharts.Options = useMemo(() => {
        return getChartOptions(categories, seriesData)
    },[categories, seriesData])

    return (
        <div className="w-full px-8 pt-6">
            <div className="flex w-full justify-between">
                <h1 className="text-xl font-medium">Expense</h1>
                <ExpenseModal
                    onAddExpense={handleAddExpense}
                    onUpdateExpense={handleUpdateExpense}
                    selectedExpense={selectedExpense}
                    open={modalOpen}
                    setOpen={handleModalOpenChange}
                />
            </div>
            {expenseList?.length ? (
                <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
                    <div className="font-medium text-lg">Expense Overview</div>
                    <div className="text-sm text-gray-500">
                        Monitor Your Expense Over Time and Gain Insights About Your Earnings
                    </div>
                    <div className="mt-8">
                        <HighchartsReact highcharts={Highcharts} options={options} />
                    </div>
                </div>
            ) : (
                null
            )}

            {loading ? (
                <div className="flex items-center justify-center w-full h-full">
                    <Spinner className="w-10 h-10" />
                </div>
            ) : expenseList?.length ? (
                <div className="border border-gray-300 mt-6 py-6 px-6 rounded-3xl h-83 overflow-y-scroll no-scrollbar">
                    <div className="grid grid-cols-2 gap-10">
                        {expenseList.map((expense: ITransactionData, index: number) => (
                            <div key={index} className="flex gap-2 justify-between items-center">
                                <div className="flex gap-2">
                                    <span className="bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center">
                                        {expense.emoji}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{expense.title}</span>
                                        <span className="text-gray-500 text-sm">{getCategoryTitle(expense.category)}</span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {expense.date ? new Date(expense.date).toLocaleDateString() : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex items-center justify-center gap-2 h-fit bg-red-100 rounded-md px-4 py-1">
                                        <span className="text-red-800 font-medium">- ${expense.amount}</span>
                                        <TrendingDownIcon className="w-4 h-4 text-red-800 font-bold" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <SquarePenIcon
                                            className="w-5 h-5 text-gray-500 cursor-pointer"
                                            onClick={() => {
                                                setSelectedExpense(expense);
                                                setModalOpen(true);
                                            }}
                                        />
                                        {/* ✅ Wired up delete handler */}
                                        <Trash2Icon
                                            className="text-red-500 w-5 h-5 cursor-pointer"
                                            onClick={() => expense._id && handleDeleteExpense(expense._id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center mt-6">
                    <div className="flex flex-col items-center gap-3 text-center border border-gray-200 rounded-2xl px-8 py-10 max-w-sm w-full">
                        <div className="w-13 h-13 rounded-full bg-gray-100 flex items-center justify-center">
                            <TrendingDownIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-gray-800">No Expense Yet</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Track Your Earnings By Adding Your First Expense Entry. It Only Takes A Few Seconds.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 gap-1.5 cursor-pointer"
                            onClick={() => setModalOpen(true)}
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Add Expense
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}