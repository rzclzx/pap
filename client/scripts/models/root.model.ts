export class Nobid{
    date: string;
    nbrName: string;
    amount: number;
}

export class NobidRequest{
    startDate: number;
    endDate: number;
    date: number;
    projectId: string;
    campaignId: string;
    adx: string;
    materialType: number;
    materialSize: string;
    type: string;
    sortType: string;
    pageNo: number;
    pageSize: number;
}

export class AdxflowRequest{
    startDate: number;
    endDate: number;
    date: number;
    adx: string;
    materialType: number;
    materialSize: string;
    type: string;
    sortType: string;
}

export class Adxflow{
    date: any;
    requestAmount: number;
    bidAmount: number;
    bidRate: number;
    winAmount: number;
    winRate: number;
    impressionAmount: number;
}

export class BidRequest{
    time: any;
    projectId: string;
    campaignId: string;
    adx: string;
    materialType: any;
    materialSize: string;
}

export class Bid{
    time: any;
    bidAmount: number;
    winAmount: number;
    impressionAmount: number;
}