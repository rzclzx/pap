import { Component,OnInit } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Project } from "../../models/project.model";
import { Nobid,NobidRequest } from "../../models/root.model";
import { Page } from "../../models/page.model";

import { ProjectService } from "../../services/project.service";
import { CampaignService } from "../../services/campaign.service"
import { BaseService } from "../../services/base.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { RootService } from "../../services/root.service";
import { PublicService } from "../../services/public.service";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "nobid-analysis",
	templateUrl: "./dist/client/views/bidAnalysis/nobidAnalysis.html"
})

export class NobidAnalysisComponent implements OnInit {

    private nobids: Array<Nobid> = [];

    private nobidRequest: NobidRequest = new NobidRequest();

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

    private dayOptions: any;

    private hoursOptions: any;

    private isPlusSort: boolean = true;

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
        this.nobidRequest.type = "01";   
        this.nobidRequest.sortType = "01";
        this.timeInit();
    }
    // 时间初始化
    private timeInit(){
        let obj = this.publicService.getTodayStartandEnd();
		this.nobidRequest.startDate = obj.startDate;
		this.nobidRequest.endDate = obj.endDate;
        this.nobidRequest.date = obj.startDate;
    }

    /**
	 * 页码功能
	 */

    private onPage(event){
        this.page.pageNo = event.offset;
        this.refreshTable();
	}
	private update(e): void{
		this.page.pageSize = e;
        this.page.pageNo = 0;
        this.refreshTable();
	}
    // 选择项目
    private selectedProject(){
        if(!this.nobidRequest.projectId){
            this.campaigns = [];
            this.nobidRequest.campaignId = undefined;
        }else{
            this.campaignService.list({projectId: this.nobidRequest.projectId}).subscribe(
                result => {
                    this.campaigns = result.body.items;
                },
                error => {
                    this.myModalService.alert(error.message);
                }
            );
            this.nobidRequest.campaignId = undefined;
        }
    }
    // 按日筛选
    private selectedDay(e){
        this.nobidRequest.startDate = e.startDate._d.getTime();
        this.nobidRequest.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
    }
    // 按小时筛选
    private selectedHours(e){
        this.nobidRequest.date = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
    }
    // 转化时间
    private toFormalTime(time){
		let formalTimeObj = new Date(time);
		let formalMonth;
		let formalDate;
		if((formalTimeObj.getMonth()+1).toString().length === 1){
			formalMonth = '0'+(formalTimeObj.getMonth()+1);
		}else{
			formalMonth = formalTimeObj.getMonth()+1;
		}
		if(formalTimeObj.getDate().toString().length === 1){
			formalDate = '0'+formalTimeObj.getDate();
		}else{
			formalDate = formalTimeObj.getDate();
		}
		let formalTime = formalMonth+'/'+formalDate+'/'+formalTimeObj.getFullYear();
		return formalTime;
	}
    // 排序
    private timeSort(){
        if(this.isPlusSort){
            this.nobidRequest.sortType = "02";
            this.isPlusSort = false;
        }else{
            this.nobidRequest.sortType = "01";
            this.isPlusSort = true;
        }
        if(this.nobids.length !== 0){
            this.refreshTable();
        }       
    }
    // 查询
    private refreshTable(){
        if(!this.nobidRequest.projectId){
            this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_PROJECT);
            return;
        }
        this.nobidRequest.pageNo = this.page.pageNo + 1;
        this.nobidRequest.pageSize = this.page.pageSize;
        this.rootService.nobidList(this.nobidRequest).subscribe(
            result => {
                let rows = [];
                for (let i = 0,len = result.body.items.length; i < len; i++) {
                    rows[(this.nobidRequest.pageNo - 1)*this.nobidRequest.pageSize+i] = result.body.items[i];
                }
                this.nobids = rows;            
                this.page = result.body.pager;
                this.page.pageNo--;
                if(!this.nobids[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
                    this.page.pageNo--;
                }            
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
    }
}