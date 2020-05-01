import { Component, OnInit, ViewChild, TemplateRef,ElementRef,Host,Inject,forwardRef} from "@angular/core";
import { Router } from "@angular/router";
import { CodeService } from "../../services/code.service";

import { Advertiser } from "../../models/advertiser.model";
import { Project } from "../../models/project.model";
import { Campaign } from "../../models/campaign.model";
import { Creative } from "../../models/creative.model";
import { MainComponent } from "../main.component";

import { AdvertiserService } from "../../services/advertiser.service";
import { ProjectService } from "../../services/project.service";
import { CampaignService } from "../../services/campaign.service";
import { CreativeService } from "../../services/creative.service";
import { DataService } from "../../services/data.service";
import { CutStringService } from "../../services/cutstring.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "flow-list",
	templateUrl: "./dist/client/views/flowData/flowList.html"
})

export class FlowListComponent implements OnInit {

	public startDate;
	public endDate;
	private baseFileUrl;

	private errorMessage: string;
	private advertisers: Advertiser[] = [];
	// 当前选中的广告主
	private advertiser: Advertiser;
	private projects: Project[];
	// 当前选中的项目
	private project: Project;
	private campaigns: Campaign[];
	// 当前选中的活动
	private campaign: Campaign;
	private creatives: Creative[];
    // 当前选中的创意
	private creative: Creative;
	// 当前选中的radio
	private currentType;

	private type = [
		{ name:this.chineseService.config.ADVERTISER, value:"advertisers" },
		{ name:this.chineseService.config.PROJECT, value:"projects" },
		{ name:this.chineseService.config.CAMPAIGN, value:"campaigns" },
		{ name:this.chineseService.config.CREATIVE, value:"creatives" },
	];

	private datas = [];

	public options = {
		locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
		autoUpdateInput: false
	}

	private currentObjString: string;

	private reconfirmObjString: string;
	
	private currentObjCode: Object;

	private currentTypeCode: Object;

	private summaryType: string;

	private refreshTableOptions: Object;

	constructor(
		private router:Router,
		private advertiserService: AdvertiserService,
		private projectService: ProjectService,
		private campaignService: CampaignService,
		private creativeService: CreativeService,
		private dataService: DataService,
		private cut: CutStringService,
		private myModalService: MyModalService,
		private chineseService: ChineseService,
		private publicService: PublicService,
		@Host() @Inject(forwardRef(()=> MainComponent)) mainComponent:MainComponent
	) {
		mainComponent.currentInit();
	}

	ngOnInit() {
		this.baseFileUrl = eval(profiles + ".imgurlHref");
		this.summaryType = "01";
		this.currentObjCode = {
			"advertiser": 0,
			"project": 1,
			"campaign": 2
		};
		this.currentTypeCode = {
			"advertisers": 0,
			"projects": 1,
			"campaigns": 2
		}
		this.currentType = this.type[0];
		this.timeInit();
		// 请求广告主下拉框内容
		this.advertiserService.list()
			.subscribe(
				result => {
					if (result.head.httpCode == 200 || result.head.httpCode == 404) {
						let items = result.body.items || [];
						this.advertisers = items;
					}
				},
				error => this.errorMessage = <any>error);
	}
	private timeInit(){
		let obj = this.publicService.getTodayStartandEnd();
		this.startDate = obj.startDate;
		this.endDate = obj.endDate;
	}

	private selectedDate(e) {
		this.startDate = e.startDate._d.getTime();
        this.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.refreshTable();
	}

	private selectAdvertiser() {
		if (this.advertiser != null) {
			// 赋值焦点id
			this.currentObjString = "advertiser";
			// 请求项目下拉框内容
			this.projectService.list({"advertiserId":this.advertiser.id})
				.subscribe(
					result => {
						if (result.head.httpCode == 200 || result.head.httpCode == 404) {
							this.projects = result.body.items;
						}
					},
					error => this.errorMessage = <any>error);

			this.refreshTable();
			
		}else{
			this.advertiser = undefined;
			this.currentObjString = "";
		}
		this.project = undefined;			
		this.campaign = undefined;
		this.projects = [];
		this.campaigns = [];
	}

	private selectProject() {
		if (this.project != null) {
			// 赋值焦点id
			this.currentObjString = "project";
			//制空campaign
			// 请求活动下拉框内容
			this.campaignService.list({"projectId":this.project.id})
				.subscribe(
					result => {
						if (result.head.httpCode == 200 || result.head.httpCode == 404) {
							this.campaigns = result.body.items;
						}
					},
					error => this.errorMessage = <any>error);

			this.refreshTable();
		}else{
			this.project = undefined;
			if(this.advertiser){
				this.currentObjString = "advertiser";
			}
		}
		this.campaign = undefined;
		this.campaigns = [];
	}

	private selectCampaign() {
		if (this.campaign != null) {
			// 赋值焦点id
			this.currentObjString = "campaign";
			// 使用当前选中的活动绘制表格
			this.refreshTable();
		}else{
			this.campaign = undefined;
			if(this.project){
				this.currentObjString = "project";
			}
		}
	}
	//详情按钮跳转，根据选择的数据
	gotoAnalysis(row){
		// 确定go人群分析页面的传输时间
		let startDate;
		let endDate;
		if(this.summaryType === "01"){
			startDate = this.startDate;
			endDate = this.endDate;
		}else{
			let date = row.date;
			let year = date.slice(0,4)*1;
			let month = date.slice(4,6)*1-1;
			let day = date.slice(6)*1;
			let start = new Date(year,month,day,0,0,0);
			let end = new Date(year,month,day,23,59,59);
			startDate = start.getTime();
			endDate = end.getTime();
		}
		let idArr = [];
		let gotoAnalysis = () => {
			let route = ["/home/analysis",startDate,endDate];
			route = route.concat(idArr);
			this.router.navigate(route);
		}
		if(this.currentType.value === "campaigns"){
			idArr[2] = row.id;
			this.campaignService.get(row.id).subscribe(
				result => {
					if(result.head.httpCode === 200){
						idArr[1] = result.body.projectId;
						this.projectService.get(idArr[1]).subscribe(
							result => {
								if(result.head.httpCode === 200){
									idArr[0] = result.body.advertiserId;
									gotoAnalysis();
								}
							},
							error => {
								this.myModalService.alert(error.message);
							}
						)
					}
				},
				error => {
					this.myModalService.alert(error.message);
				}
			)
		}
		if(this.currentType.value === "projects"){
			idArr[1] = row.id;
			this.projectService.get(row.id).subscribe(
				result => {
					if(result.head.httpCode === 200){
						idArr[0] = result.body.advertiserId;
						gotoAnalysis();
					}
				},
				error => {
					this.myModalService.alert(error.message);
				}
			)
		}
		if(this.currentType.value === "advertisers"){
			idArr[0] = row.id;
			gotoAnalysis();
		}
		
	}
	//将对象转化为查询参数
	ObjToSearch(obj){
		let searchArr = [];
		let searchString = '';
		for(let i in obj){
			if(obj[i]){
				searchArr.push(i+'='+obj[i]);
			}	
		}
		searchString = searchArr.join('&');
		return searchString;
	}
	// 通过焦点id和radio刷新表格
	private refreshTable(): void{
		this.reconfirmCurrentObj();
		if(!this.advertiser){
			return;
		}	
		this.dataService.list(this.currentType.value, this.refreshTableOptions).subscribe(
			result => {
				if (result.head.httpCode == 200 || result.head.httpCode == 404) {
					this.datas = result.body.items;
				}
			},
			error => this.errorMessage = <any>error);
	}
	// 焦点对象重定向
	private reconfirmCurrentObj(): void{
		if(!this.advertiser){
			return;
		}
		let objCode = this.currentObjCode[this.currentObjString];
		let typeCode = this.currentTypeCode[this.currentType.value];
		let str = this.currentType.value.slice(0,this.currentType.value.length-1);
		this.reconfirmObjString = objCode > typeCode ? str : this.currentObjString;
		this.refreshTableOptions = {
			startDate : this.startDate,
			endDate : this.endDate,
			type : this.summaryType
		};
		this.refreshTableOptions[this.reconfirmObjString+"Id"] = this[this.reconfirmObjString].id;
	}
	//根据筛选条件导出excel表格
	exportList(){
		this.reconfirmCurrentObj()
		if(this.startDate && this.advertiser){
			let url = "/data/export/" + this.currentType.value + "?";
			this.publicService.exportFile(eval(profiles + ".urlHref") + url + this.ObjToSearch(this.refreshTableOptions));
		}else{
			this.myModalService.alert(this.chineseService.config.PLEASE_INPUT_FILTER_CONDITION)
		}
					
	}
	// 判断url是视频or图片
	private confirm(url: string){
		url = typeof url == "string" ? url : "";
		let index = url.indexOf("image");
		if(index != -1){
			return "image";
		}else{
			return "video";
		}
	}
}