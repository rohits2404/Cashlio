import { ICardProps } from "@/types";
import Image from "next/image";

export const Card = ({ title, imgSrc, value }: ICardProps) => {
    return (
        <div className="flex flex-col gap-2 border border-gray-300 rounded-3xl p-4 w-[16.2rem] shadow">
            <Image src={imgSrc} alt="card-img" height={40} width={40} />
            <span className="text-xl font-medium mt-1">{title}</span>
            <span className="font-semibold text-2xl">
                {typeof value === "number"
                    ? value % 1 === 0
                        ? `$${value.toLocaleString()}`
                        : `$${value.toFixed(2)}`
                    : value}
            </span>
        </div>
    );
}