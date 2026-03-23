"use client"

import { PlusIcon, SquarePenIcon, Trash2Icon, TrendingUpIcon } from "lucide-react"
import { IncomeModal } from "./IncomeModal"
import { useAuth } from "@clerk/nextjs"
import { addIncome, deleteIncome, fetchIncome, updateIncome } from "@/services/incomeService"
import { IChartSeriesPoint, ITransactionData } from "@/types"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { fetchTransactionsList, getChartOptions } from "@/helpers"
import { INCOME_CATEGORY_CONSTANTS } from "@/constants"

const getCategoryTitle = (value: string) => {
    return INCOME_CATEGORY_CONSTANTS.find(item => item.value === value)?.title || value;
};

export const Income = () => {

    const [loading, setLoading] = useState(false);
    const [incomeList, setIncomeList] = useState<ITransactionData[]>([]);
    const [selectedIncome, setSelectedIncome] = useState<ITransactionData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const { getToken, isLoaded } = useAuth();

    const handleFetchUserIncome = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;
            const list = await fetchIncome(token);
            setIncomeList(list);
            const { newCategories = [], newSeriesData = [] } = fetchTransactionsList(list)
            setSeriesData(newSeriesData);
            setCategories(newCategories);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIncome = async (incomeObj: ITransactionData) => {
        try {
            const token = await getToken();
            if (!token) return;
            // ✅ Removed incorrect optimistic update
            await addIncome(incomeObj, token);
            await handleFetchUserIncome();
            toast.success("Income Added Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Add Income");
        }
    }

    const handleUpdateIncome = async (income: ITransactionData) => {
        try {
            const token = await getToken();
            if (!income?._id || !token) return;
            await updateIncome(income, income._id, token);
            await handleFetchUserIncome();
            toast.success("Income Updated Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Update Income");
        }
    }

    const handleDeleteIncome = async (id: string) => {
        try {
            const token = await getToken();
            if (!token) return;
            await deleteIncome(id, token);
            await handleFetchUserIncome();
            toast.success("Income Deleted Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed To Delete Income");
        }
    }

    // ✅ Reset selectedIncome when modal closes so Add mode works fresh
    const handleModalOpenChange = (open: boolean) => {
        setModalOpen(open);
        if (!open) setSelectedIncome(null);
    };

    useEffect(() => {
        if (!isLoaded) return;
        handleFetchUserIncome();
    }, [isLoaded]);

    const options: Highcharts.Options = useMemo(() => {
        return getChartOptions(categories, seriesData)
    },[categories, seriesData])

    return (
        <div className="w-full px-8 pt-6">
            <div className="flex w-full justify-between">
                <h1 className="text-xl font-medium">Income</h1>
                <IncomeModal
                    onAddIncome={handleAddIncome}
                    onUpdateIncome={handleUpdateIncome}
                    selectedIncome={selectedIncome}
                    open={modalOpen}
                    setOpen={handleModalOpenChange}
                />
            </div>
            {incomeList?.length ? (
                <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
                    <div className="font-medium text-lg">Income Overview</div>
                    <div className="text-sm text-gray-500">
                        Monitor Your Income Over Time and Gain Insights About Your Earnings
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
            ) : incomeList?.length ? (
                <div className="border border-gray-300 mt-6 py-6 px-6 rounded-3xl h-83 overflow-y-scroll no-scrollbar">
                    <div className="grid grid-cols-2 gap-10">
                        {incomeList.map((income: ITransactionData, index: number) => (
                            <div key={index} className="flex gap-2 justify-between items-center">
                                <div className="flex gap-2">
                                    <span className="bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center">
                                        {income.emoji}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{income.title}</span>
                                        <span className="text-gray-500 text-sm">{getCategoryTitle(income.category)}</span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {income.date ? new Date(income.date).toLocaleDateString() : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex items-center justify-center gap-2 h-fit bg-green-100 rounded-md px-4 py-1">
                                        <span className="text-green-800 font-medium">+ ${income.amount}</span>
                                        <TrendingUpIcon className="w-4 h-4 text-green-800 font-bold" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <SquarePenIcon
                                            className="w-5 h-5 text-gray-500 cursor-pointer"
                                            onClick={() => {
                                                setSelectedIncome(income);
                                                setModalOpen(true);
                                            }}
                                        />
                                        {/* ✅ Wired up delete handler */}
                                        <Trash2Icon
                                            className="text-red-500 w-5 h-5 cursor-pointer"
                                            onClick={() => income._id && handleDeleteIncome(income._id)}
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
                            <TrendingUpIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-gray-800">No Income Yet</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Track Your Earnings By Adding Your First Income Entry. It Only Takes A Few Seconds.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 gap-1.5 cursor-pointer"
                            onClick={() => setModalOpen(true)}
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Add Income
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}