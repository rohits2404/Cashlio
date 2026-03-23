"use client"

import { ChartTypes, IChartSeriesPoint, ITransactionData } from "@/types";
import { useEffect, useMemo, useState } from "react"
import { TransactionsModal } from "./TransactionsModal";
import { useAuth } from "@clerk/nextjs";
import { addIncome, deleteIncome, updateIncome } from "@/services/incomeService";
import { addExpense, deleteExpense, updateExpense } from "@/services/expenseService";
import { toast } from "sonner";
import { fetchAllTransaction } from "@/services/transactionService";
import { fetchTransactionsList, getChartOptions } from "@/helpers";
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { PlusIcon, SquarePenIcon, Trash2Icon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { EXPENSE_CATEGORY_CONSTANTS, INCOME_CATEGORY_CONSTANTS } from "@/constants";

// ✅ Moved outside component — pure function, no need to recreate on every render
const getCategoryTitle = (value: string, transactionType: string) => {
    const constants = transactionType === "income"
        ? INCOME_CATEGORY_CONSTANTS
        : EXPENSE_CATEGORY_CONSTANTS;
    return constants.find(item => item.value === value)?.title || value;
};

export const Transactions = () => {

    const { getToken } = useAuth();

    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionObj, setTransactionObj] = useState<ITransactionData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [transactionList, setTransactionList] = useState<ITransactionData[]>([]);
    const [chartType, setChartType] = useState<ChartTypes>("column");

    const handleAddTransaction = async (transactionObj: ITransactionData) => {
        try {
            const token = await getToken();
            if (!token) return;
            if (transactionObj.transactionType === "income") {
                await addIncome(transactionObj, token);
            } else {
                await addExpense(transactionObj, token);
            }
            await handleFetchUserTransaction();
            toast.success("Transaction Added Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Error Adding Transaction");
        }
    }

    const handleUpdateTransaction = async (transactionObj: ITransactionData) => {
        try {
            const token = await getToken();
            if (!token) return;
            if (transactionObj.transactionType === "income") {
                await updateIncome(transactionObj, transactionObj._id || "", token);
            } else {
                await updateExpense(transactionObj, transactionObj._id || "", token);
            }
            await handleFetchUserTransaction();
            toast.success("Transaction Updated Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Error Updating Transaction");
        }
    }

    const handleDeleteTransaction = async (transaction: ITransactionData) => {
        try {
            const token = await getToken();
            if (!token) return;
            const { _id = "", transactionType } = transaction;
            if (transactionType === "income") {
                await deleteIncome(_id, token);
            } else {
                await deleteExpense(_id, token);
            }
            await handleFetchUserTransaction();
            toast.success("Transaction Deleted Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Delete Transaction");
        }
    }

    const handleFetchUserTransaction = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;
            const transactions = await fetchAllTransaction(token);
            setTransactionList(transactions);
            const { newCategories = [], newSeriesData = [] } = fetchTransactionsList(transactions);
            setSeriesData(newSeriesData);
            setCategories(newCategories);
        } catch (error) {
            console.error(error);
        } finally {
            // ✅ Always runs even if error thrown
            setLoading(false);
        }
    }

    const handleChartType = () => {
        setChartType(prev => prev === "line" ? "column" : "line");
    }

    // ✅ Reset transactionObj when modal closes
    const handleModalOpenChange = (open: boolean) => {
        setShowTransactionModal(open);
        if (!open) {
            setTransactionObj(null);
            setIsEditMode(false);
        }
    };

    const options: Highcharts.Options = useMemo(() => {
        return getChartOptions(categories, seriesData, chartType);
    }, [categories, seriesData, chartType]);

    useEffect(() => {
        handleFetchUserTransaction();
    }, []);

    return (
        <div className="w-full px-8 pt-6">
            <div className="flex w-full justify-between">
                <h1 className="text-xl font-medium">Transactions</h1>
                <TransactionsModal
                    onAddTransaction={handleAddTransaction}
                    onUpdateTransaction={handleUpdateTransaction}
                    showTransactionModal={showTransactionModal}
                    setShowTransactionModal={handleModalOpenChange}
                    transactionObj={transactionObj}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    type="transaction"
                    showTransactionType={true}
                />
            </div>

            {/* ✅ Chart only shown when not loading and has data */}
            {!loading && transactionList?.length ? (
                <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-medium text-lg">Transactions Overview</div>
                            <div className="text-sm text-gray-500">
                                Monitor Your Transactions Over Time and Gain Insights About Your Earnings
                            </div>
                        </div>
                        <Button className="cursor-pointer" onClick={handleChartType}>
                            {/* ✅ Label shows what you'll switch TO, not current */}
                            Switch to {chartType === "line" ? "Column" : "Line"}
                        </Button>
                    </div>
                    <div className="mt-8">
                        <HighchartsReact highcharts={Highcharts} options={options} />
                    </div>
                </div>
            ) : null}

            {loading ? (
                <div className="flex items-center justify-center w-full h-full mt-10">
                    <Spinner className="w-10 h-10" />
                </div>
            ) : transactionList?.length ? (
                <div className="mt-4 px-6 border border-gray-300 rounded-3xl h-83 overflow-y-scroll no-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Icon</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Edit</TableHead>
                                <TableHead>Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionList.map((transaction: ITransactionData, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="text-2xl">{transaction.emoji}</TableCell>
                                    <TableCell className="font-medium">{transaction.title}</TableCell>
                                    <TableCell className="capitalize">{transaction.transactionType}</TableCell>
                                    {/* ✅ Pass transaction's own type, not stale transactionObj state */}
                                    <TableCell>{getCategoryTitle(transaction.category, transaction.transactionType || "")}</TableCell>
                                    <TableCell>
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {transaction.transactionType === "income" ? (
                                                <TrendingUpIcon className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <TrendingDownIcon className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={transaction.transactionType === "income" ? "text-green-500" : "text-red-500"}>
                                                ${transaction.amount}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <SquarePenIcon
                                            className="w-5 h-5 text-gray-500 cursor-pointer"
                                            onClick={() => {
                                                setIsEditMode(true);
                                                setShowTransactionModal(true);
                                                setTransactionObj(transaction);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Trash2Icon
                                            className="w-5 h-5 text-red-500 cursor-pointer"
                                            onClick={() => handleDeleteTransaction(transaction)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex items-center justify-center mt-6">
                    <div className="flex flex-col items-center gap-3 text-center border border-gray-200 rounded-2xl px-8 py-10 max-w-sm w-full">
                        <div className="w-13 h-13 rounded-full bg-gray-100 flex items-center justify-center gap-1">
                            <TrendingUpIcon className="w-4 h-4 text-gray-400" />
                            <TrendingDownIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-gray-800">No Transactions Yet</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Track your finances by adding your first transaction entry.
                            </p>
                        </div>
                        {/* ✅ Wired up to open modal */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 gap-1.5 cursor-pointer"
                            onClick={() => setShowTransactionModal(true)}
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Add Transaction
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}