"use client"

import { EXPENSE_IMAGE, INCOME_IMAGE, TOTAL_BALANCE_IMAGE, TOTAL_TRANSACTION_IMAGE, USER_IMAGE } from "@/constants";
import { useAuth, useUser } from "@clerk/nextjs"
import Image from "next/image";
import { Card } from "./Card";
import { useEffect, useMemo, useState } from "react";
import { getCategoryLabel, getCategoryWiseValue, getMoneyFlowOptions, getMonthlyIncomeExpense, getPieChartOptions } from "@/helpers";
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { fetchIncome } from "@/services/incomeService";
import { fetchExpense } from "@/services/expenseService";
import { IPieData, ITransactionData } from "@/types";
import { fetchAllTransaction } from "@/services/transactionService";
import { ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Progress } from "./Progress";
import { Spinner } from "./ui/spinner";

export const Dashboard = () => {

    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [loading, setLoading] = useState(false);
    const [incomeList, setIncomeList] = useState<ITransactionData[]>([]);
    const [expenseList, setExpenseList] = useState<ITransactionData[]>([]);
    const [transactions, setTransactions] = useState<ITransactionData[]>([]);
    const [incomeSeries, setIncomeSeries] = useState<number[]>([]);
    const [expenseSeries, setExpenseSeries] = useState<number[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categorySeries, setCategorySeries] = useState<IPieData[]>([]);

    const dashboardValues = useMemo(() => {
        const incomeValue = incomeList.reduce((sum, i) => sum + Number(i.amount), 0);
        const expenseValue = expenseList.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalBalance = incomeValue - expenseValue;
        const totalTransaction = incomeList.length + expenseList.length;
        return { incomeValue, expenseValue, totalBalance, totalTransaction };
    }, [incomeList, expenseList]);

    const handleFetchAllData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const [income, expense, allTransactions] = await Promise.all([
                fetchIncome(token),
                fetchExpense(token),
                fetchAllTransaction(token),
            ]);

            setIncomeList(income);
            setExpenseList(expense);
            setTransactions(allTransactions);

            const { incomeSeries, expenseSeries, categories } =
                await getMonthlyIncomeExpense(income, expense);
            setIncomeSeries(incomeSeries);
            setExpenseSeries(expenseSeries);
            setCategories(categories);

            const series = getCategoryWiseValue(allTransactions);
            setCategorySeries(series);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const { topCategory, categoryExpense } = useMemo(() => {
        const map: Record<string, number> = {};

        transactions.forEach((item) => {
            if (item.transactionType === "expense") {
                if (!map[item.category]) map[item.category] = 0;
                map[item.category] += Number(item.amount);
            }
        });

        let categoryExpenseRaw = 0;
        let topCategory = "";

        for (const category in map) {
            if (map[category] > categoryExpenseRaw) {
                categoryExpenseRaw = map[category];
                topCategory = category;
            }
        }

        const categoryExpense = dashboardValues.expenseValue
            ? (categoryExpenseRaw / dashboardValues.expenseValue) * 100
            : 0;

        return { topCategory, categoryExpense };
    }, [transactions, dashboardValues.expenseValue]);

    const savingsRate = useMemo(() => {
        const { incomeValue, expenseValue } = dashboardValues;
        if (incomeValue === 0) return 0;
        return ((incomeValue - expenseValue) / incomeValue) * 100;
    }, [dashboardValues]);

    const incomeSpent = useMemo(() => {
        const { incomeValue, expenseValue } = dashboardValues;
        if (incomeValue === 0) return 0;
        return (expenseValue / incomeValue) * 100;
    }, [dashboardValues]);

    const moneyFlowOptions = useMemo(() => {
        return getMoneyFlowOptions(categories, incomeSeries, expenseSeries);
    }, [categories, incomeSeries, expenseSeries]);

    const categoryFlowOptions = useMemo(() => {
        return getPieChartOptions(categorySeries);
    }, [categorySeries]);

    useEffect(() => {
        handleFetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Spinner className="w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="w-full px-8 pt-6 overflow-y-scroll no-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-2xl font-medium">
                        Welcome Back, {user?.fullName}
                    </span>
                    <span className="text-gray-500 text-sm -mt-0.5">
                        It Is The Best Time To Manage Your Finances
                    </span>
                </div>
                <div className="flex items-center justify-center shadow gap-2 border border-gray-300 rounded-full py-1.5 pr-4 pl-1.5">
                    <Image
                        src={user?.imageUrl || USER_IMAGE}
                        alt="User"
                        height={32}
                        width={32}
                        className="rounded-full"
                    />
                    <div className="flex flex-col">
                        <span className="text-base font-medium">{user?.fullName}</span>
                        <span className="text-xs text-gray-500">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <Card title="Total Balance" value={dashboardValues.totalBalance} imgSrc={TOTAL_BALANCE_IMAGE} />
                <Card title="Income" value={dashboardValues.incomeValue} imgSrc={INCOME_IMAGE} />
                <Card title="Expense" value={dashboardValues.expenseValue} imgSrc={EXPENSE_IMAGE} />
                <Card title="Total Transactions" value={dashboardValues.totalTransaction} imgSrc={TOTAL_TRANSACTION_IMAGE} />
            </div>

            <div className="flex items-start justify-between gap-4 mt-8">
                <div className="border border-gray-300 rounded-3xl flex-2 pb-2 pt-6 px-4 flex flex-col relative">
                    <span className="absolute font-medium text-xl top-6.5">Money Flow</span>
                    <div className="mt-4">
                        <HighchartsReact highcharts={Highcharts} options={moneyFlowOptions} />
                    </div>
                </div>
                <div className="border border-gray-300 rounded-3xl flex-1 pb-2 pt-6 px-4 flex flex-col relative">
                    <span className="font-medium text-xl absolute top-6.5">Category Breakdown</span>
                    <div className="pb-4">
                        <HighchartsReact highcharts={Highcharts} options={categoryFlowOptions} />
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-4 justify-between mt-8">
                <div className="border border-gray-300 rounded-3xl flex-2 pb-5 pt-6 px-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-xl">Recent Transactions</span>
                        <span
                            className="font-medium flex items-center text-sm gap-1 border border-gray-300 rounded-full py-1.5 px-3 cursor-pointer"
                            onClick={() => router.push("/transactions")}
                        >
                            See All
                            <ChevronRightIcon className="w-4 h-4" />
                        </span>
                    </div>
                    <Table className="mt-4">
                        <TableHeader className="bg-titan-white text-white rounded-full">
                            <TableRow>
                                <TableHead className="rounded-l-full text-cornflower-blue uppercase">Icon</TableHead>
                                <TableHead className="text-cornflower-blue uppercase">Date</TableHead>
                                <TableHead className="text-cornflower-blue uppercase">Amount</TableHead>
                                <TableHead className="text-cornflower-blue uppercase">Title</TableHead>
                                <TableHead className="text-cornflower-blue uppercase">Type</TableHead>
                                <TableHead className="rounded-r-full text-cornflower-blue uppercase">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.slice(0, 3).map((item: ITransactionData) => (
                                <TableRow key={item._id}>
                                    <TableCell className="text-xl">{item.emoji}</TableCell>
                                    <TableCell className="font-medium">
                                        {item.date ? new Date(item.date).toLocaleDateString() : ""}
                                    </TableCell>
                                    <TableCell className="font-medium">${item.amount}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="font-medium capitalize">{item.transactionType}</TableCell>
                                    <TableCell className="font-medium">{getCategoryLabel(item.category)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="border border-gray-300 rounded-3xl flex-1 pb-2 pt-6 px-4">
                    <span className="font-medium text-xl">Financial Summary</span>
                    <div>
                        <Progress title={topCategory || "Top Spending"} percentage={categoryExpense} />
                        <Progress title="Savings Rate" percentage={savingsRate} />
                        <Progress title="Income Spent" percentage={incomeSpent} />
                    </div>
                </div>
            </div>
        </div>
    );
}