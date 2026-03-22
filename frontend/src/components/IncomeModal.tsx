import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import EmojiPicker from "emoji-picker-react";
import { IEmojiObject, ITransactionData } from "@/types";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { INCOME_CATEGORY_CONSTANTS } from "@/constants";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { toast } from "sonner";

export const IncomeModal = ({
    onAddIncome,
    onUpdateIncome,
    selectedIncome,
    open,
    setOpen
}: {
    onAddIncome: (incomeData: ITransactionData) => void;
    onUpdateIncome: (incomeData: ITransactionData) => void;
    selectedIncome: ITransactionData | null;
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState("🚀");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date | null>(null);
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
    };

    const handleSubmit = async () => {
        if (!selectedEmoji || !title || !category || !amount || !date) {
            toast.error("All Fields are Required");
            return;
        }
        const incomeData: ITransactionData = {
            _id: selectedIncome?._id,
            emoji: selectedEmoji,
            title,
            category,
            amount: Number(amount),
            date
        };
        if (selectedIncome) {
            onUpdateIncome(incomeData);
        } else {
            onAddIncome(incomeData);
        }
        setOpen(false);
    };

    // ✅ Single unified useEffect — populates form for edit, resets for add
    useEffect(() => {
        if (open) {
            if (selectedIncome) {
                setSelectedEmoji(selectedIncome.emoji);
                setTitle(selectedIncome.title);
                setCategory(selectedIncome.category);
                setAmount(String(selectedIncome.amount));
                setDate(selectedIncome.date ? new Date(selectedIncome.date) : null);
            } else {
                resetForm();
            }
        }
    }, [open, selectedIncome]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">Add Income</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {selectedIncome ? "Edit Income" : "Add Income"}
                    </DialogTitle>
                    <DialogDescription>
                        Add Income To The List In Just a Few Simple Steps
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 mt-2">
                    <div className="relative">
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                                <button className="text-2xl border border-gray-300 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                                    {selectedEmoji}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="bottom" align="start" sideOffset={8} className="p-0 border rounded-lg shadow-lg bg-white z-50">
                                <div className="w-70 sm:w-[320px] h-80 overflow-hidden">
                                    <EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height="100%" />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="w-full">
                        <span className="font-medium">Title</span>
                        <Input className="mt-2" placeholder="Enter Income Title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                                    {INCOME_CATEGORY_CONSTANTS.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>{item.title}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <span className="font-medium">Amount</span>
                        <Input className="mt-2" placeholder="0.00" type="number" onChange={(e) => setAmount(e.target.value)} value={amount} />
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
                        {selectedIncome ? "Update Income" : "Add Income"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}