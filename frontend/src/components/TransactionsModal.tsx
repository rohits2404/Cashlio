import { EXPENSE_CATEGORY_CONSTANTS, INCOME_CATEGORY_CONSTANTS, TRANSACTION_CATEGORY_CONSTANTS } from "@/constants";
import { IEmojiObject, ITransactionData } from "@/types"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import EmojiPicker from "emoji-picker-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";

export const TransactionsModal = ({
    onAddTransaction,
    onUpdateTransaction,
    showTransactionModal,
    setShowTransactionModal,
    transactionObj,
    isEditMode,
    setIsEditMode,
    type,
    showTransactionType = false
}: {
    onAddTransaction: (data: ITransactionData) => void;
    onUpdateTransaction: (data: ITransactionData) => void;
    showTransactionModal: boolean;
    setShowTransactionModal: (value: boolean) => void;
    transactionObj: ITransactionData | null;
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    type: string;
    showTransactionType?: boolean;
}) => {

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState("🚀");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    // ✅ Always string to keep input controlled consistently
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [transactionType, setTransactionType] = useState("");
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleEmojiSelect = (emojiObj: IEmojiObject) => {
        setSelectedEmoji(emojiObj.emoji);
        setShowEmojiPicker(false);
    }

    const resetForm = () => {
        setSelectedEmoji("🚀");
        setTitle("");
        setCategory("");
        setAmount("");
        setDate(null);
        setTransactionType("");
    };

    const handleSubmit = () => {
        if (!selectedEmoji || !title || !category || !amount || !date || (showTransactionType && !transactionType)) {
            toast.error("All Fields are Required");
            return;
        }
        const data: ITransactionData = {
            emoji: selectedEmoji,
            title,
            category,
            amount: Number(amount),
            date,
            _id: transactionObj?._id,
            transactionType
        };
        if (isEditMode) {
            onUpdateTransaction(data);
        } else {
            onAddTransaction(data);
        }
        setShowTransactionModal(false);
    }

    // ✅ Single unified useEffect — populates for edit, resets for add (same pattern as IncomeModal)
    useEffect(() => {
        if (showTransactionModal) {
            if (transactionObj) {
                setSelectedEmoji(transactionObj.emoji);
                setTitle(transactionObj.title);
                setCategory(transactionObj.category);
                setAmount(String(transactionObj.amount));
                setDate(transactionObj.date ? new Date(transactionObj.date) : null);
                setTransactionType(transactionObj.transactionType || "");
            } else {
                resetForm();
            }
        }
    }, [showTransactionModal, transactionObj]);

    const modalTitle = isEditMode
        ? `Edit ${type === "income" ? "Income" : type === "transaction" ? "Transaction" : "Expense"}`
        : `Add ${type === "income" ? "Income" : type === "transaction" ? "Transaction" : "Expense"}`;

    // ✅ Category list reacts to selected transactionType in the form
    const TRANSACTION_CATEGORY = transactionType === "income"
        ? INCOME_CATEGORY_CONSTANTS
        : EXPENSE_CATEGORY_CONSTANTS;

    return (
        <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">{`Add ${type === "income" ? "Income" : type === "transaction" ? "Transaction" : "Expense"}`}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                    <DialogDescription>
                        {modalTitle} To The List In Just a Few Simple Steps
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-start justify-center gap-4">
                    {/* ✅ EmojiPicker in Popover — consistent with IncomeModal, no overflow issues */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                            <button className="text-3xl border border-gray-300 py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition">
                                {selectedEmoji}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="start" sideOffset={8} className="p-0 border rounded-lg shadow-lg bg-white z-50">
                            <div className="w-70 sm:w-[320px] h-80 overflow-hidden">
                                <EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height="100%" />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {showTransactionType && (
                        <div className="w-full">
                            <span className="font-medium">Transaction Type</span>
                            <Select
                                onValueChange={(value) => {
                                    setTransactionType(value);
                                    // ✅ Reset category when type changes so stale category doesn't persist
                                    setCategory("");
                                }}
                                value={transactionType}
                                disabled={isEditMode}
                            >
                                <SelectTrigger className="mt-2 w-full cursor-pointer">
                                    <SelectValue placeholder="Select Transaction Type" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectLabel>Type</SelectLabel>
                                        {TRANSACTION_CATEGORY_CONSTANTS.map((item) => (
                                            <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                                                {item.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="w-full">
                        <span className="font-medium">Title</span>
                        <Input
                            placeholder={`Enter ${type === "transaction" ? "Transaction" : type === "income" ? "Income" : "Expense"} Title`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    <div className="w-full">
                        <span className="font-medium">Category</span>
                        <Select onValueChange={(value) => setCategory(value)} value={category}>
                            <SelectTrigger className="mt-2 w-full cursor-pointer">
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Category</SelectLabel>
                                    {TRANSACTION_CATEGORY.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>{item.title}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full">
                        <span className="font-medium">Amount</span>
                        <Input
                            placeholder="0.00"
                            type="number"
                            onChange={(e) => setAmount(e.target.value)}
                            value={amount}
                            className="mt-2"
                        />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <span className="font-medium">Date</span>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex justify-between items-center w-full">
                                    {date ? new Date(date).toLocaleDateString() : "Select Date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0">
                                <Calendar
                                    mode="single"
                                    selected={date ?? undefined}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDate(date ?? null);
                                        setCalendarOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="cursor-pointer">
                        {/* ✅ Button label reflects edit vs add mode */}
                        {isEditMode ? "Update Transaction" : "Add Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}