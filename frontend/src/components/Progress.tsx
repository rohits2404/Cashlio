export const Progress = ({ title, percentage }: { title: string; percentage: number }) => {

    const safePercentage = isNaN(percentage) ? 0 : Math.min(percentage, 100);
    
    return (
        <div className="flex gap-2 mt-4 flex-col">
            <span className="font-medium text-base capitalize">{title || "—"}</span>
            <div className="flex items-center gap-2">
                <div className="w-full h-5 bg-titan-white rounded-full overflow-hidden">
                    <div
                        className="h-5 bg-cornflower-blue rounded-full transition-all duration-300"
                        style={{ width: `${safePercentage}%` }}
                    />
                </div>
                <span className="font-medium text-sm whitespace-nowrap">
                    {safePercentage.toFixed(1)}%
                </span>
            </div>
        </div>
    );
}