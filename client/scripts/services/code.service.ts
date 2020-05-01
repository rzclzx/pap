/**
 * Created by Haoyu Chen on 31-12-2016.
 * 码表服务
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";


@Injectable()
export class CodeService {

    private activityType = [
        { name: "单落地页多创意", value: "01" },
        { name: "多落地页单创意", value: "02" }
    ];

    private frequencyControlObj = [
        { name:"每个活动", value:"01" },
        { name:"每个创意", value:"02" }
    ];

    private frequencyTimeType = [
        { name:"每天", value:"01" },
        { name:"每小时", value:"02" }
    ];

    private adTypeTarget = [
        { name:"图片", value:"01"},
        { name:"视频", value:"02" },
        { name:"信息流", value:"03" }
    ];

    private networkTarget = [
        { name:"wifi", value:"1" },
        { name:"2G", value:"3" },
        { name:"3G", value:"4" },
        { name:"4G", value:"5" }
    ];

    private operatorTarget = [
        { name:"中国移动", value:"1" },
        { name:"中国联通", value:"2" },
        { name:"中国电信", value:"3" }
    ];

    private deviceTarget = [
        { name:"手机", value:"1" },
        { name:"平板", value:"2" }
        // { name:"电视", value:"3" }
    ];

    private osTarget = [
        { name:"ios", value:"1" },
        { name:"android", value:"2" }
        // { name:"windows", value:"3" }
    ];

    private flowType = [
        { name:"APP", value:"01" },
        { name:"地域", value:"02" }
    ];

    private topOpt = [
        { name:"10", value:10 },
        { name:"30", value:30 },
        { name:"50", value:50 },
        { name:"80", value:80 },
        { name:"100", value:100 }
    ];

    private historyData = [
        { name:"前一小时", value:"01" },
		{ name:"前两小时", value:"02" }
    ];

    private execCycle = [
        { name:"一小时", value:"01" },
		{ name:"两小时", value:"02" }
    ];

    private dataType = [
        { name:"展现", value:"01" },
		{ name:"点击", value:"02" }
    ];

    private compareType = [
        { name:"小于", value:"01" },
        { name:"大于", value:"02" }
    ];
    // 待续 改private
    public advertiserStatus = {
        "01":"未审核",
        "02":"审核中",
        "03":"审核通过",
        "04":"审核不通过"
    }

    public get(name) {
        return this[name];
    };
}