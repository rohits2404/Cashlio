import { BadgeDollarSign, Home, TrendingDown, TrendingUp } from "lucide-react";

export const APP_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const SIDEBAR_CONSTANTS = [
    {
        id: "/",
        title: "Dashboard",
        icon: Home,
    },

    {
        id: "/transactions",
        title: "Transactions",
        icon: BadgeDollarSign,
    },
    {
        id: "/income",
        title: "Income",
        icon: TrendingUp,
    },
    {
        id: "/expense",
        title: "Expense",
        icon: TrendingDown,
    },
];

const EXPENSE_CATEGORY_CONSTANTS = [
    {
        value: "food",
        title: "Food",
    },
    {
        value: "entertainment",
        title: "Entertainment",
    },
    {
        value: "groceries",
        title: "Groceries",
    },
    {
        value: "utilities",
        title: "Utilities",
    },
    {
        value: "transport",
        title: "Transport",
    },
    {
        value: "shopping",
        title: "Shopping",
    },
];

const INCOME_CATEGORY_CONSTANTS = [
    {
        value: "business",
        title: "Business",
    },
    {
        value: "freelance",
        title: "Freelance",
    },
    {
        value: "salary",
        title: "Salary",
    },
    {
        value: "investment",
        title: "Investment",
    },
    {
        value: "rentalIncome",
        title: "Rental Income",
    },
    {
        value: "otherIncome",
        title: "Other Income",
    },
];

const TRANSACTION_CATEGORY_CONSTANTS = [
    {
        value: "income",
        title: "Income",
    },
    {
        value: "expense",
        title: "Expense",
    },
];

const USER_IMAGE = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
const TOTAL_BALANCE_IMAGE = "https://cdn-icons-png.flaticon.com/128/2169/2169864.png";
const INCOME_IMAGE = "https://cdn-icons-png.flaticon.com/128/3176/3176837.png";
const EXPENSE_IMAGE = "https://cdn-icons-png.flaticon.com/128/3176/3176833.png";
const TOTAL_TRANSACTION_IMAGE = "https://cdn-icons-png.flaticon.com/128/10691/10691348.png";

export {
    SIDEBAR_CONSTANTS,
    EXPENSE_CATEGORY_CONSTANTS,
    INCOME_CATEGORY_CONSTANTS,
    TRANSACTION_CATEGORY_CONSTANTS,
    USER_IMAGE,
    TOTAL_BALANCE_IMAGE,
    INCOME_IMAGE,
    EXPENSE_IMAGE,
    TOTAL_TRANSACTION_IMAGE,
};