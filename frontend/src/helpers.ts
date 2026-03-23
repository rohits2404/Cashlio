import { fetchIncome } from "@/services/incomeService";
import { fetchExpense } from "@/services/expenseService";
import {
    ITransactionData,
    ChartTypes,
    IChartSeriesPoint,
    IPieData,
} from "./types";
import {
    EXPENSE_CATEGORY_CONSTANTS,
    INCOME_CATEGORY_CONSTANTS,
} from "@/constants";

const ALL_CATEGORY_CONSTANTS = [
    ...INCOME_CATEGORY_CONSTANTS,
    ...EXPENSE_CATEGORY_CONSTANTS,
];

const getCategoryLabel = (value: string): string => {
    return ALL_CATEGORY_CONSTANTS.find((c) => c.value === value)?.title || value;
};

const fetchTransactionsList = (list: ITransactionData[]) => {
    if (!list?.length) return { newSeriesData: [], newCategories: [] };

    const chartData = list.map((t: ITransactionData) => ({
        x: new Date(t.date || ""),
        y: Number(t.amount),
        type: t.transactionType,
        icon: t.emoji,
        category: getCategoryLabel(t.category),
    }));

    const sortedChartDataByDate = chartData.sort(
        (a, b) => a.x.getTime() - b.x.getTime()
    );

    const newSeriesData = sortedChartDataByDate.map((point, index: number) => {
        const { y, type, icon, category, x } = point;
        return {
            x: index,
            y,
            type,
            icon,
            tCategory: category,
            rawDate: x,
        };
    });

    const newCategories = sortedChartDataByDate.map((p) =>
        p.x.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    );

    return { newSeriesData, newCategories };
};

const getChartOptions = (
    categories: string[],
    seriesData: IChartSeriesPoint[],
    chartType: ChartTypes = "column"
): Highcharts.Options => {
    return {
        title: { text: "" },
        xAxis: {
            type: "category",
            categories,
        },
        credits: { enabled: false },
        chart: {
            height: 250,
            backgroundColor: "transparent",
        },
        legend: { enabled: false },
        yAxis: { title: { text: "" } },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "white",
            formatter: function (this: any) {
                const { type, icon, tCategory } = this.point;
                const dataLabel = categories[this.x];
                const textClass =
                    type === "income" ? "text-green-500" : "text-red-500";
                return `<div class="p-2 border shadow rounded-md flex flex-col items-center justify-start">
                    <div class="flex w-full justify-between">
                        <span class="text-sm">Date:</span>
                        <span class="font-medium text-sm">${dataLabel}</span>
                    </div>
                    <div class="flex items-center justify-between w-full gap-1">
                        <span class="text-sm">Category:</span>
                        <span class="font-medium text-sm">${tCategory}</span>
                    </div>
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-1">
                            <span class="text-sm">${icon}</span>
                            <span class="text-sm">${type === "income" ? "Income:" : "Expense:"}</span>
                        </div>
                        <span class="font-medium ${textClass} text-sm">$${this.y}</span>
                    </div>
                </div>`;
            },
        },
        plotOptions: {
            column: { borderRadius: 8 },
        },
        series: [
            {
                type: chartType,
                data: seriesData,
                color: "#8271fe",
            },
        ],
    };
};

const getDashboardValues = async (token: string) => {
    const incomeList = await fetchIncome(token);
    const expenseList = await fetchExpense(token);

    let incomeValue = 0;
    let expenseValue = 0;

    incomeList.forEach((income: ITransactionData) => {
        incomeValue += Number(income.amount);
    });
    expenseList.forEach((expense: ITransactionData) => {
        expenseValue += Number(expense.amount);
    });

    const totalBalance = incomeValue - expenseValue;
    const totalTransaction = incomeValue + expenseValue;

    return { incomeValue, expenseValue, totalBalance, totalTransaction };
};

const getMonthlyIncomeExpense = async (
    incomeList: ITransactionData[],
    expenseList: ITransactionData[]
) => {
    const formatMonth = (itemDate: Date) => {
        return new Date(itemDate).toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    };

    const monthMap: Record<string, { income: number; expense: number }> = {};

    incomeList.forEach((item) => {
        if (item.date) {
            const month = formatMonth(item.date);
            if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
            monthMap[month].income += Number(item.amount);
        }
    });

    expenseList.forEach((item) => {
        if (item.date) {
            const month = formatMonth(item.date);
            if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
            monthMap[month].expense += Number(item.amount);
        }
    });

    const categories = Object.keys(monthMap).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const incomeSeries = categories.map((m) => monthMap[m].income);
    const expenseSeries = categories.map((m) => monthMap[m].expense);

    return { incomeSeries, expenseSeries, categories };
};

const getMoneyFlowOptions = (
    categories: string[],
    incomeSeries: number[],
    expenseSeries: number[]
): Highcharts.Options => {
    return {
        chart: {
            type: "column",
            backgroundColor: "transparent",
            marginTop: 60,
        },
        title: { text: "" },
        legend: {
            align: "right",
            verticalAlign: "top",
            layout: "horizontal",
            symbolRadius: 6,
            symbolHeight: 10,
            symbolWidth: 10,
            itemStyle: { fontSize: "14px", fontWeight: "500" },
            y: -22,
        },
        xAxis: {
            categories,
            title: { text: "" },
            labels: {
                style: { fontSize: "12px", fontWeight: "500", color: "#6a7282" },
            },
        },
        yAxis: {
            title: { text: "" },
            labels: {
                style: { fontSize: "12px", fontWeight: "500", color: "#6a7282" },
                formatter: function () {
                    return `$${this.value}`;
                },
            },
            gridLineColor: "#e0e0e0",
        },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "transparent",
            formatter: function () {
                return `<div class="bg-white py-1 px-4 text-base font-medium border border-gray-300 rounded-3xl">$${this.y}</div>`;
            },
        },
        plotOptions: {
            column: {
                grouping: true,
                borderWidth: 0,
                pointWidth: 40,
                borderRadius: 20,
                groupPadding: 0.1,
                states: {
                    hover: { enabled: false },
                    inactive: { enabled: false },
                },
            },
        },
        credits: { enabled: false },
        series: [
            { name: "Income", type: "column", data: incomeSeries, color: "#8271fe" },
            { name: "Expense", type: "column", data: expenseSeries, color: "#c0b9fa" },
        ],
    };
};

const getPieChartOptions = (categorySeries: IPieData[]): Highcharts.Options => {
    const totalValue = categorySeries.reduce((sum, ct) => sum + ct.y, 0);

    return {
        chart: { type: "pie", backgroundColor: "transparent" },
        credits: { enabled: false },
        title: { text: "" },
        subtitle: {
            useHTML: true,
            text: `<div style="text-align:center">
                <div class="text-gray-400 text-sm font-medium">Total Amount</div>
                <div class="text-2xl font-semibold text-[#333]">$${totalValue}</div>
            </div>`,
            floating: true,
            verticalAlign: "middle",
            align: "center",
            y: -12,
        },
        legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            floating: false,
            itemStyle: { fontSize: "14px", fontWeight: "500" },
        },
        tooltip: {
            shape: "rect",
            useHTML: true,
            shadow: false,
            backgroundColor: "transparent",
            formatter: function () {
                return `<div class="bg-white py-1 px-4 text-base font-medium border border-gray-300 rounded-full">$${this.y}</div>`;
            },
        },
        plotOptions: {
            pie: {
                innerSize: "80%",
                size: "85%",
                borderWidth: 4,
                borderColor: "#f4f4f4",
                borderRadius: 20,
                dataLabels: { enabled: false },
                showInLegend: true,
                states: {
                    hover: { enabled: false },
                    inactive: { enabled: false },
                },
            },
        },
        series: [{ type: "pie", data: categorySeries }],
    };
};

const getCategoryWiseValue = (transactions: ITransactionData[]) => {
    const categoryMap: Record<string, number> = {};

    transactions.forEach((tr) => {
        if (!categoryMap[tr.category]) categoryMap[tr.category] = 0;
        categoryMap[tr.category] += Number(tr.amount);
    });

    return Object.entries(categoryMap).map(([value, y]) => ({
        name: getCategoryLabel(value),
        y,
    }));
};

export {
    getChartOptions,
    fetchTransactionsList,
    getDashboardValues,
    getMonthlyIncomeExpense,
    getMoneyFlowOptions,
    getPieChartOptions,
    getCategoryWiseValue,
    getCategoryLabel,
};