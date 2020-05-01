export class ImageTmpl{
    id:string;
    formats:string;
    maxVolume:string;
    width:string;
    height:string;
    adxName: string;
    adxId: string;
}

export class VideoTmpl{
    id:string;
    formats:string;
    maxVolume:string;
    maxTimelength:string;
    width:string;
    height:string;
    ImageTmpl:ImageTmpl;
    adxName: string;
    adxId: string;
}

export class InfoflowTmpl{
    id:string;
    maxTitle:string;
    maxDescription:string;
    maxCtaDescription:string;
    mustDescription:boolean;
    mustCtaDescription:boolean;
    haveDescription: string;
    haveCtaDescription: string;
    icon:ImageTmpl;
    image1:ImageTmpl;
    image2:ImageTmpl;
    image3:ImageTmpl;
    adxName: string;
    adxId: string;
}