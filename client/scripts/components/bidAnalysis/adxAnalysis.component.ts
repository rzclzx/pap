import { Component,OnInit,ViewChild } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Project } from "../../models/project.model";
import { AdxflowRequest,Adxflow } from "../../models/root.model";
import { Page } from "../../models/page.model";

import { BaseService } from "../../services/base.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { RootService } from "../../services/root.service";
import { PublicService } from "../../services/public.service";
import * as echarts from "echarts";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "adx-analysis",
	templateUrl: "./dist/client/views/bidAnalysis/adxAnalysis.html"
})

export class AdxAnalysisComponent implements OnInit {

    @ViewChild("amountEcharts") amountEcharts;
    @ViewChild("rateEcharts") rateEcharts;
    private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

    private adxAnalysisOptions;

    private adxflowRequest: AdxflowRequest = new AdxflowRequest();

    private adxflows: Array<Adxflow> = [];

    private adxs: any;

    private materials: any;

    private sizes: any;

    private dayOptions: any;

    private hoursOptions: any;

    private isPlusSort: boolean = true;

    private sortAdxflows = [];

    private listAdxflows = [];

    private amountEchartsObj;

    private rateEchartsObj;

    constructor(
        private router: Router,
        private myModalService: MyModalService,
        private chineseService: ChineseService,
        private rootService: RootService,
        private publicService: PublicService
    ){}

    ngOnInit(){
        this.dataInit();  
    }
    // 数据初始化
    private dataInit(){
        this.amountEchartsObj = echarts.init(this.amountEcharts.nativeElement);
        this.rateEchartsObj = echarts.init(this.rateEcharts.nativeElement);
        this.adxAnalysisOptions = this.clone(this.chineseService.config.ADX_ANALYSIS_OPTIONS);
        this.rootService.sizeList().subscribe(
            result => {
                this.sizes = result.body.items;
            },
            error => {
                this.myModalService.alert(error.message);
            }
        );
        this.dayOptions = {
            locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
            autoUpdateInput: false
        };
        this.hoursOptions = {
            locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
            singleDatePicker: true,
            autoUpdateInput: false
        }
        this.adxs = this.chineseService.config.ADVERTISER_ADX;
        this.materials = this.chineseService.config.MATERIAL;
        this.adxflowRequest.type = "01";
        this.adxflowRequest.sortType = "01";
        this.timeInit();
    }
    // 时间初始化
    private timeInit(){
        let obj = this.publicService.getTodayStartandEnd();
		this.adxflowRequest.startDate = obj.startDate;
		this.adxflowRequest.endDate = obj.endDate;
        this.adxflowRequest.date = obj.startDate;
    }

    /**
	 * 页码功能
	 */

    private onPage(event){
        this.page.pageNo = event.offset;
	}
	private update(e): void{
		this.page.pageSize = e;
        this.page.pageNo = 0;
        this.refreshTable();
	}
    
    // 按日筛选
    private selectedDay(e){
        this.adxflowRequest.startDate = e.startDate._d.getTime();
        this.adxflowRequest.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
    }
    // 按小时筛选
    private selectedHours(e){
        this.adxflowRequest.date = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
    }
    // 排序
    private timeSort(){
        if(this.isPlusSort){
            this.adxflowRequest.sortType = "02";
            this.isPlusSort = false;
        }else{
            this.adxflowRequest.sortType = "01";
            this.isPlusSort = true;
        }
        if(this.adxflows.length !== 0){
            this.refreshTable();
        }       
    }
    // amount bar
    private showAmountBar(){
        let data = [],
            xnames = [],
            dataValue = {
                requestAmount: [],
                bidAmount: [],
                winAmount: [],
                impressionAmount: []
            },
            options;
        this.sortAdxflows = this.publicService.sortByone(this.adxflows,"date");
        // 初始化x轴name参数
        for(let i = 0;i < this.sortAdxflows.length;i++){
            xnames[i] = this.adxflowRequest.type === "01" ? this.publicService.FormalTimeMonthandday(this.sortAdxflows[i].date) : this.publicService.FormalTimeHoursandminute(this.sortAdxflows[i].date);
            for(let j = 0;j < 4;j++){
                if(this.adxAnalysisOptions[j].isExist){
                    dataValue[this.adxAnalysisOptions[j].value][i] = this.sortAdxflows[i][this.adxAnalysisOptions[j].value];
                }
            }
        }
        // 初始化data参数
        for(let i = 0;i < 4;i++){
            if(this.adxAnalysisOptions[i].isExist){
                data.push({
                    name: this.adxAnalysisOptions[i].name,
                    value: dataValue[this.adxAnalysisOptions[i].value]
                })
            }
        }
        // 绘画
        if(xnames.length !== 0 && data.length !== 0){
            options = this.publicService.getThreeBar(data,xnames,false);
            this.amountEchartsObj.setOption(options,true);
        }else{
            this.amountEchartsObj.clear();
        }
    }
    // Rate bar
    private showRateBar(){
        let data = [],
            xnames = [],
            dataValue = {
                bidRate: [],
                winRate: []
            },
            options;

        for(let i = 0;i < this.sortAdxflows.length;i++){
            this.sortAdxflows[i].bidRate = (this.sortAdxflows[i].bidRate*100).toFixed(2);
            this.sortAdxflows[i].winRate = (this.sortAdxflows[i].winRate*100).toFixed(2);
        }
        // 初始化x轴name参数
        for(let i = 0;i < this.sortAdxflows.length;i++){
            xnames[i] = this.adxflowRequest.type === "01" ? this.publicService.FormalTimeMonthandday(this.sortAdxflows[i].date) : this.publicService.FormalTimeHoursandminute(this.sortAdxflows[i].date);
            for(let j = 4;j < 6;j++){
                if(this.adxAnalysisOptions[j].isExist){
                    dataValue[this.adxAnalysisOptions[j].value][i] = this.sortAdxflows[i][this.adxAnalysisOptions[j].value];
                }
            }
        }
        // 初始化data参数
        for(let i = 4;i < 6;i++){
            if(this.adxAnalysisOptions[i].isExist){
                data.push({
                    name: this.adxAnalysisOptions[i].name,
                    value: dataValue[this.adxAnalysisOptions[i].value]
                })
            }
        }
        // 绘画
        if(xnames.length !== 0 && data.length !== 0){
            options = this.publicService.getThreeBar(data,xnames,true);
            this.rateEchartsObj.setOption(options,true);
        }else{
            this.rateEchartsObj.clear();
        }
    }
    // 查询
    private refreshTable(){
        if(!this.adxflowRequest.adx){
            this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_ADX);
            return;
        }
        this.rootService.adxAnalysisList(this.adxflowRequest).subscribe(
            result => {
                this.adxflows = result.body.items;           
                this.showAmountBar();
                this.showRateBar();
                this.listFormalTime();
                               
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
    }
    // 列表时间格式化
    private listFormalTime(){
        this.listAdxflows = this.clone(this.adxflows);
        for(let i = 0;i < this.listAdxflows.length;i++){
            this.listAdxflows[i].date = this.adxflowRequest.type === "01" ? this.publicService.FormalTimeLine(this.listAdxflows[i].date) : this.publicService.FormalTimeHoursandminute(this.listAdxflows[i].date);
        }
        this.page.total = this.listAdxflows.length;
        if(!this.listAdxflows[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
            this.page.pageNo--;
        } 
    }
    // 克隆对象
	private clone(obj){
		return JSON.parse(JSON.stringify(obj));
	} 
}