import { Component,OnInit,ViewChild } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Project } from "../../models/project.model";
import { Bid,BidRequest } from "../../models/root.model";
import { Page } from "../../models/page.model";

import { ProjectService } from "../../services/project.service";
import { CampaignService } from "../../services/campaign.service"
import { BaseService } from "../../services/base.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { RootService } from "../../services/root.service";
import { PublicService } from "../../services/public.service";
import * as echarts from "echarts";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "bid-analysis",
	templateUrl: "./dist/client/views/bidAnalysis/bidAnalysis.html"
})

export class BidAnalysisComponent implements OnInit {

    @ViewChild("bidEcharts") bidEcharts;

    private bids: Array<Bid> = [];

    private bidRequest: BidRequest = new BidRequest();

    private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

    private projects: Array<Project> = [];

    private adxs: any;

    private materials: any;

    private sizes: any;

    private campaigns = [];

    private timeOptions: any;

    private showTime: string;

    private adxAnalysisOptions;

    private bidEchartsObj;

    constructor(
        private router: Router,
        private projectService: ProjectService,
        private myModalService: MyModalService,
        private chineseService: ChineseService,
        private rootService: RootService,
        private campaignService: CampaignService,
        private publicService: PublicService
    ){}

    ngOnInit(){
        this.dataInit();  
    }
    // 数据初始化
    private dataInit(){
        this.bidEchartsObj = echarts.init(this.bidEcharts.nativeElement);
        this.adxAnalysisOptions = this.publicService.clone(this.chineseService.config.ADX_ANALYSIS_OPTIONS);
        this.projectService.list().subscribe(
            result => {
                this.projects = result.body.items;
            },
            error => {
                this.myModalService.alert(error.message);
            }
        );
        this.rootService.sizeList().subscribe(
            result => {
                this.sizes = result.body.items;
            },
            error => {
                this.myModalService.alert(error.message);
            }
        );
        this.adxs = this.chineseService.config.ADVERTISER_ADX;
        this.materials = this.chineseService.config.MATERIAL1;
        this.timeInit();
    }
    // 时间初始化
    private timeInit(){
        let time = this.publicService.getNow();
        this.bidRequest.time = time;
        this.timeOptions = {
            locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            autoUpdateInput: false,
            startDate: this.publicService.toFormalTime(this.bidRequest.time)
        }
    }

    /**
	 * 页码功能
	 */

    // 选择项目
    private selectedProject(){
        if(!this.bidRequest.projectId){
            this.campaigns = [];
            this.bidRequest.campaignId = undefined;
        }else{
            this.campaignService.list({projectId: this.bidRequest.projectId}).subscribe(
                result => {
                    this.campaigns = result.body.items;
                },
                error => {
                    this.myModalService.alert(error.message);
                }
            );
            this.bidRequest.campaignId = undefined;
        }
    }
    // 按日筛选
    private selectedTime(e){
        this.bidRequest.time = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
    }
    // 查询
    private render(){
        if(!this.bidRequest.projectId){
            this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_PROJECT);
            return;
        }
        this.rootService.bidList(this.bidRequest).subscribe(
            result => {
                this.bids = this.publicService.sortByone(result.body.items,"time"); 
                this.showAmountBar();
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
    }
    // amount bar
    private showAmountBar(){
        let data = [],
            xnames = [],
            dataValue = {
                bidAmount: [],
                winAmount: [],
                impressionAmount: []
            },
            options;
        // 初始化x轴name参数
        for(let i = 0;i < this.bids.length;i++){
            xnames[i] = this.getTime(this.bids[i].time);
            for(let j = 1;j < 4;j++){             
                dataValue[this.adxAnalysisOptions[j].value][i] = this.bids[i][this.adxAnalysisOptions[j].value];           
            }
        }
        // 初始化data参数
        for(let i = 1;i < 4;i++){       
            data.push({
                name: this.adxAnalysisOptions[i].name,
                value: dataValue[this.adxAnalysisOptions[i].value]
            })       
        }
        // 绘画
        if(xnames.length !== 0 && data.length !== 0){
            options = this.publicService.getThreeBar(data,xnames,false);
            this.bidEchartsObj.setOption(options,true);
        }else{
            this.bidEchartsObj.clear();
        }
    } 
    private getTime(time){
        return this.publicService.FormalTimeHoursandminute(time) + " ~ " + this.publicService.FormalTimeHoursandminute(time + 1000*60*10);
    }
}