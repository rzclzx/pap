/**
 * Created by haoyu chen on 2016-12-21.
 */
import { Kpi } from "./kpi.model";

export class Advertiser {
    id: string;
    name: string;  // 广告主名称，必需。最大长度100。
    company: string;  // 公司名称，必需。最大长度100。           
    siteUrl: string;
    siteName: string;
    industryId: number;
    industryName: string;
    kpis: Kpi[];
    qualificationNo: string;
    qualificationPath: string;
    legalName: string;
    validDate: number;
    qualificationType: number;
    remark: string;
    brandName: string;
    qq: string;
    adxIds: Array<string> = [];
    audits: Array<Audit> = [new Audit()];
}

export class Audit {
    id: string;
    adxId: string;
    name: string;
    status: string;
    enable: string;
    message: string;
}