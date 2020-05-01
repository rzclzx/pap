/**
 * Created by haoyu chen on 2016-12-30.
 */

export class Campaign {
    id?:string;
    name:string;
    projectId:string;
    type:string;
    startDate:number;
    endDate:number;
    dailyBudget:number;
    dailyImpression:number;
    dailyClick:number;
    status: string;
    frequency?:Frequency = new Frequency();
    // monitors?:Array<Monitor> = [new Monitor()];
    remark:string;
    quantities: Quantity[] = [new Quantity()];
    uniform: string;
    landpageName: string;
    landpageId: string;
    landpageUrl?: string;
    ruleGroupId: string = "";
    statusMessage?: string;
    target: CampaignTarget = new CampaignTarget();
}

export class CampaignTarget {
    regions?:Array<any>;
    region?:Array<string>;
    adType?:Array<string>;
    time?:Array<string>;
    network?:Array<string>;
    operator?:Array<string>;
    device?:Array<string>;
    os?:Array<string>;
    brand?:Array<string>;
    population?:TargetPopulation = new TargetPopulation();
    adx?: string;
    include?: Array<any>;
    exclude?: Array<any>;
}

export class TargetPopulation {
    id: string;
    type: string;
}

export class Quantity {
    startDate: number;
    endDate: number;
    budget: number;
    impression: number;
}

export class Frequency {
    controlObj:string;
    timeType:string;
    number:string;
}

class Monitor {
    impressionUrl?:string = "";
    clickUrl?:string = "";
}