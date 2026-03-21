'use client'

import { SIDEBAR_CONSTANTS } from "@/constants"
import { cn } from "@/lib/utils"
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs"
import { CircleDollarSignIcon, LogOutIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export const Sidebar = () => {

    const pathname = usePathname();
    const router = useRouter();

    const handleSidebar = (id: string) => {
        router.push(id);
    }

    const { user } = useUser();

    return (
        <div className="bg-woodsmoke w-1/5 h-full flex justify-between flex-col p-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <CircleDollarSignIcon className="text-white h-9 w-9"/>
                    <span className="text-white font-semibold text-base">
                        Cashio
                    </span>
                </div>
                <span className="text-gray-300 text-sm font-medium mt-8">MENU</span>
                <div className="ml-2 mt-4 flex flex-col gap-3">
                    {SIDEBAR_CONSTANTS.map((item) => {
                        const { icon: Icon, title, id } = item;
                        const itemSelectedClass = id === pathname ? "bg-[#17181c] border-[#242728]" : "";
                        return (
                            <div 
                            key={id} 
                            className={cn(
                                'flex gap-2 cursor-pointer py-2 px-3 rounded-md w-[95%] border border-transparent', 
                                itemSelectedClass
                            )}
                            onClick={() => handleSidebar(id)}
                            >
                                <Icon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400">{title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            {user && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 cursor-pointer py-2 px-2">
                        <UserButton/>
                        <span className="text-sm text-gray-400 py-2">{user.fullName}</span>
                    </div>
                    <SignOutButton redirectUrl="/sign-in">
                        <button className="flex gap-2 cursor-pointer border border-shark bg-woodsmoke py-2 px-3 rounded-md">
                            <LogOutIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-400">Logout</span>
                        </button>
                    </SignOutButton>
                </div>
            )}
        </div>
    )
}