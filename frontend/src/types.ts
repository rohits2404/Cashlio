type IUser = {
    firstName: string;
    lastName: string;
    imageUrl: string;
};

export type IWithAuthProps = {
    user: IUser;
};

export type IEmojiObject = {
    emoji: string;
};

export type ITransactionData = {
    emoji: string;
    title: string;
    category: string;
    amount: number;
    date: Date | null;
    transactionType?: string;
    _id?: string;
};

export type ChartPoint = {
    x: Date;
    y: number;
    type: string;
    icon: string;
    category: string;
};

export type IPieData = {
    name: string;
    y: number;
};

export type ChartTypes = "line" | "column" | "bar";

export type ICardProps = {
    title: string;
    imgSrc: string;
    value: number;
};

export type IChartSeriesPoint = {
    x: number;
    y: number;
    type?: string;
    icon: string;
    tCategory: string;
    rawDate: Date;
};