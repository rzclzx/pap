/**
 * Created by haoyu chen on 2017-1-3.
 * 创意类
 */

export class Creative {
    id?:string;
    // name:string;
    type?:string;
    campaignId:string;
    tmplId:string;
    price:string;
    status:string;
    impressionAmount?:number;
    clickAmount?:number;
    clickRate?:number;
    jumpAmount?:number;
    totalCost?:number;
    impressionCost?:number;
    clickCost?:number;
    jumpCost?:number;
    adxId?: string;
    adxName: string;
    enable: string;
}

export class CreativeGroup {
    image:CreativeImage[];
    video:CreativeVideo[];
    infoflow:CreativeInfoFlow[];
}

export class CreativeImage extends Creative{
    imageId:string;
}

export class CreativeVideo extends Creative{
    imageId:string;
    videoId:string;
}

export class CreativeInfoFlow extends Creative{
    infoflowId:string;
    title:string;
    description:string;
    ctaDescription:string;
    iconId:string;
    image1Id:string;
    image2Id:string;
    image3Id:string;
}