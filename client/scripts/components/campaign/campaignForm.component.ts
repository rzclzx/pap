import { Component,OnInit,OnDestroy,ViewChild,ContentChildren,forwardRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Location } from "@angular/common";

import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";

import { CodeService } from "../../services/code.service";
import { CampaignService } from "../../services/campaign.service";
import { LandpageService } from "../../services/landpage.service";
import { PopulationService } from "../../services/population.service";
import { AdvertiserService } from "../../services/advertiser.service";
import { ProjectService } from "../../services/project.service";
import { WeekRangePickerService } from "../../services/weekRangePicker.service";
import { CutStringService } from "../../services/cutstring.service";
import { MyModalService } from "../../services/myModal.service";
import { ValidationService } from "../../services/validation.service";
import { AppService } from "../../services/app.service";
import { MaskService } from "../../services/mask.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";

import { ModalWeekRangeComponent } from "./modalWeekRange.component";
import { ModalRegionComponent } from "./modalRegion.component";
import { ModalAppComponent } from "./modalApp.component";

import { WeekRangePickerModule } from "../../modules/weekRangePicker.module"

import { CampaignTarget } from "../../models/campaign.model";
import { Campaign,Quantity,Frequency } from "../../models/campaign.model";
import { Population } from "../../models/population.model";
import { TargetPopulation } from "../../models/campaign.model";
import { Project } from "../../models/project.model";
import { Subject } from "rxjs/Subject";
import * as moment from "moment";
declare var $;

@Component({
	selector: "campaign-form",
	templateUrl: "./dist/client/views/campaign/campaignForm.html",
	providers: [ WeekRangePickerService ]
})

export class CampaignFormComponent implements OnInit {


	private campaign:Campaign = new Campaign();

	private activityTypes: any;

	private controlObjs: any;

	private timeTypes: any;

	private dateRangeOptions: any;

	private isEdit: any;

	private id:string;

	private year: any;

	private month: any;

	private day: any;

	private detailShow: any;

	private formalTimes: any;

	private landpageArr: any;

	private detailOptions: any = [];

	private detailFormalEnd: any = [];

	private isFrequency: any = false;

	private isCheck: string;

	private locale: Object;

	private isCopy: boolean;

	private checkCodes: Array<string> = [];

	private copyTarget;

	private getCampaignSubject = new Subject();

	private initCampaigntargetBeginCount = 0;

	private ruleGroups = [];


	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private codeService: CodeService,
		private campaignService: CampaignService,
		private landpageService:LandpageService,
		private polationService: PopulationService,
		private advertiserService: AdvertiserService,
		private projectService: ProjectService,
		private weekRangePickerService: WeekRangePickerService,
		private cut: CutStringService,
		private location: Location,
		private myModalService: MyModalService,
		private validationService:ValidationService,
		private appService: AppService,
		private maskService: MaskService,
		private chineseService: ChineseService,
		private publicService: PublicService
	) {}

	ngOnInit(){
		this.dataInit();
		// 根据路由渲染组件
		if(this.route.snapshot.params["isCopy"]){
			this.isCopy = true;
			let rowString = window.sessionStorage.getItem("campaign");
			let rowJson = JSON.parse(rowString);
			this.initCampaign(rowJson.id);
		}else{
			if(this.route.snapshot.params["projectId"]){
				this.creaInit();
			}else if(this.route.snapshot.params["campaignid"]){
				this.id = this.route.snapshot.params["campaignid"];
				this.initCampaign(this.id);
				this.isEdit = true;
			}
		}
	}
	// 数据初始化
	private dataInit(){
		this.campaignid = this.route.snapshot.params["campaignid"] ? this.route.snapshot.params["campaignid"] : undefined;
		this.locale = this.chineseService.config.TIMERANGEPICKER_CONFIG;
		this.detailShow = false;
		this.landpageArr = [];
		this.landpageService.list()
			.subscribe(
				resultInfo => {
					this.landpageArr = resultInfo.body.items;
				},
				error => {
					this.myModalService.alert(error.message);
				}
			);
		this.activityTypes = this.codeService.get("activityType");
		this.controlObjs = this.codeService.get("frequencyControlObj");
		this.timeTypes = this.codeService.get("frequencyTimeType");
		this.initSelectStatus(this.selectorNames);
		this.getCampaignSubject.subscribe({
			next: (data) => {
				if(data === 2){
					this.initCampaigntarget();
				}			
			}
		});
		this.getPopulations();
	}


	//新创建情况下初始化数据

	creaInit(){
		this.fireTarget();
		this.campaign.projectId = this.route.snapshot.params["projectId"];
		this.isEdit = false;
		//初始化新创建时间
		let obj = this.publicService.getTodayStartandEnd();
		this.campaign.startDate = obj.startDate;
		this.campaign.endDate = obj.endDate;
		this.formalTimes = this.showTimes(this.campaign.startDate,this.campaign.endDate);
		//初始化新创建情况的外部周期插件对象
		this.campaign.quantities[0].startDate = this.campaign.startDate;
		this.campaign.quantities[0].endDate = this.campaign.endDate;
		this.detailFormalEnd[0] = this.toFormalTime(this.campaign.quantities[0].endDate);
		this.dateRangeOptions = {
			//minDate: this.filterMinTime(),
			locale: this.locale,
			autoUpdateInput: false
		}
		//初始化新创建情况下高级设置第一条插件对象
		this.detailOptions = [{
			singleDatePicker: true,
				startDate: this.toFormalTime(this.campaign.endDate),
				minDate: this.toFormalTime(this.campaign.quantities[0].startDate),
				maxDate: this.toFormalTime(this.campaign.endDate),	
				locale: this.locale,
				autoUpdateInput: false
		}];
	}
	// 定向发射
	private fireTarget(){
		this.initCampaigntargetBeginCount++;
		this.getCampaignSubject.next(this.initCampaigntargetBeginCount);
	}

	//请求数据
	initCampaign(id){
		this.campaignService.get(id)
			.subscribe(
				resultInfo => {
					this.setCampaign(resultInfo)
				},
				error => this.errorMessage = <any>error
			);
	}
	//初始化编辑活动对象
	setCampaign(resultInfo){
		if (resultInfo.head.httpCode == 200) {

			Object.assign(this.campaign,resultInfo.body);	
			this.fireTarget();
			//如果高级设置为一条则与外部等价
			if(this.campaign.quantities.length == 1){
				this.campaign.quantities[0].startDate = this.campaign.startDate;
				this.campaign.quantities[0].endDate = this.campaign.endDate;
			}
			//初始化落地页
			if(this.campaign.landpageName){
				for(let i=0;i<this.landpageArr.length;i++){
					if(this.campaign.landpageName === this.landpageArr[i].name){
						this.campaign.landpageId = this.landpageArr[i].id;
						this.campaign.landpageUrl = this.landpageArr[i].url;
						this.isCheck = this.landpageArr[i].monitorUrl ? "是" : "否";
						this.checkCodes = this.landpageArr[i].codes;
					}
				}
			}
			this.id = this.campaign.id;
			//是否返回频次
			this.isFrequency = this.campaign.frequency.controlObj ? true : false;
			
			//初始化日期
			this.formalTimes = this.showTimes(this.campaign.startDate,this.campaign.endDate);
			this.dateRangeOptions = {
				//minDate: this.filterMinTime(),
				startDate: this.toFormalTime(this.campaign.startDate),
				endDate: this.toFormalTime(this.campaign.endDate),
				locale: this.locale,
				autoUpdateInput: false
			}
			//初始化详细结束时间
			for(let i=0;i<this.campaign.quantities.length;i++){
				this.detailFormalEnd[i] = this.toFormalTime(this.campaign.quantities[i].endDate);					
			}
			//初始化详细时间插件属性
			for(let i=0;i<this.campaign.quantities.length;i++){
				this.detailOptions.push({
					singleDatePicker: true,
					startDate: this.toFormalTime(this.campaign.endDate),
					minDate: this.toFormalTime(this.campaign.quantities[i].startDate),
					maxDate: this.toFormalTime(this.campaign.endDate),
					autoUpdateInput: false,
					locale: this.locale
				})
			}		
			//高级设置是否展开
			if(this.campaign.quantities.length>1){
				this.detailShow = true;
				setTimeout(() => {
					for(let i=0;i<this.campaign.quantities.length;i++){
						if(i != (this.campaign.quantities.length-1)){
							$('#'+i).attr('disabled','disabled');
						}
					}
				},20);			
			}
			if(this.isCopy){
				this.campaign.name = undefined;
				this.campaign.projectId = this.route.snapshot.params["projectId"];
			}
		}
	}

	//保存操作
	baseSave(urlArr){
		if (this.validationService.validate()) {
			if(!this.campaign.uniform){
				this.campaign.uniform = '0';
			}
			this.setLandpage();
			if(!this._Validate()){
				return false;
			}
			this.saveCampaign().subscribe(
				result => {
					if ((!this.isEdit&&result.head.httpCode == 201) || (this.isEdit&&result.head.httpCode == 204)) {
						let id;
						if(!this.isCopy){
							id = this.id ? this.id : result.body.id;
						}else{
							id = result.body.id;									
						}
						if(!urlArr[1]){
							urlArr[1] = id;
							urlArr.push("image");
						}
						this.router.navigate(urlArr);							
					}else{
						this.myModalService.alert(result.body.message);
					}
				},
				error => {
					this.myModalService.alert(error.message);
				}
			);
		} else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
	}

	//保存活动前设置活动
	saveCampaign(){
		//去除无用属性
		let campaignObj = new Campaign;
		for(let key in this.campaign){
			campaignObj[key] = this.campaign[key];
		}
		//频次没有则必须传空，后端规定
		if(!this.campaign.frequency.controlObj && !this.campaign.frequency.timeType && !this.campaign.frequency.number){
			campaignObj.frequency = null;
		}
		if(!this.isEdit){
			return this.campaignService.create(campaignObj)
		}else{
			return this.campaignService.update(this.id,campaignObj)
		}
	}

	//落地页保存
	setLandpage(){
		for(let i=0;i<this.landpageArr.length;i++){
			if(this.campaign.landpageName === this.landpageArr[i].name){
				this.campaign.landpageId = this.landpageArr[i].id;
				this.campaign.landpageUrl = this.landpageArr[i].url;
			}
		}
	}
	
	// 显示周期
	showTimes(start,end){
		let startTime = start;
		let endTime = end;
		return this.toFormalTime(startTime)+' - '+this.toFormalTime(endTime);
	}
	//将时间戳转换为日期
	toFormalTime(time){
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
	//显示高级设置
	detailshow(){
		if(!this.detailShow){
			if(this.campaign.startDate){
				this.detailShow = true;
			}else{
				this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_CAMPAIGN_RANGE)
			}
		}else{
			this.detailShow = false;
		}
		let that = this;
		if(this.detailShow){
			setTimeout(() => {
				for(let i=0;i<this.campaign.quantities.length;i++){
					if(i != (this.campaign.quantities.length-1)){
						$('#'+i).attr('disabled','disabled');
					}
				}
		    },20);			
		}
	}
	//添加高级设置条目
	addDetailList(i){
		$('#'+i).attr('disabled','disabled');
		this.detailFormalEnd[i+1] = this.toFormalTime(this.campaign.endDate);
		this.campaign.quantities.push({
			startDate: this.campaign.quantities[i].endDate+1000,
			endDate: this.campaign.endDate,
			budget: null,
			impression: null
		});		
		
		this.detailOptions.push({
			singleDatePicker: true,
			startDate: this.toFormalTime(this.campaign.endDate),
			minDate: this.toFormalTime(this.campaign.quantities[i+1].startDate),
			maxDate: this.toFormalTime(this.campaign.endDate),
			autoUpdateInput: false,			
			locale: this.locale
		})	
	}
	//删除高级设置列表
	closeDetailList(v){	
		let index = this.campaign.quantities.indexOf(v);
		if(index == this.campaign.quantities.length-1){
			if(this.campaign.quantities.length>1){
				$('#'+(index-1)).attr('disabled',null);
				this.campaign.quantities[index-1].endDate = this.campaign.endDate;
				this.detailFormalEnd[index-1] = this.toFormalTime(this.campaign.endDate);
				this.campaign.quantities.splice(index,1);
				this.detailOptions.splice(index,1);
				this.reInitTimeplate(this.detailOptions[index-1],{
					startDate: this.toFormalTime(this.campaign.endDate),
					minDate: this.toFormalTime(this.campaign.quantities[index-1].startDate)
				},"detailOptions");   
			}else if(this.campaign.quantities.length === 1){
				this.detailshow();
			}
		}else{
			this.myModalService.alert(this.chineseService.config.ALSO_DELETE_LAST_MESSAGE);
		}
	}
	selectedDate(event:any){
		//如果重新选择日期，更新高级设置的第一条数据
		this.campaign.startDate = event.startDate._d.getTime();
		this.campaign.endDate = event.endDate._d.getTime() - event.endDate._d.getTime()%1000;
		this.formalTimes = this.showTimes(this.campaign.startDate,this.campaign.endDate);
		this.campaign.quantities[0].startDate = this.campaign.startDate;
		this.campaign.quantities[0].endDate = this.campaign.endDate;
		this.detailFormalEnd[0] = this.toFormalTime(this.campaign.quantities[0].endDate);
		//如果重新选择外部周期，则更新高级设置的options
		this.reInitTimeplate(this.detailOptions[0],{
			startDate: this.toFormalTime(this.campaign.quantities[0].endDate),
			minDate: this.toFormalTime(this.campaign.quantities[0].startDate),
			maxDate: this.toFormalTime(this.campaign.quantities[0].endDate)
		},"detailOptions");  	
	}
	selectedDatailDate(event:any,i:number){
		this.campaign.quantities[i].endDate = event.end._d.getTime() - event.end._d.getTime()%1000;
		this.detailFormalEnd[i] = this.toFormalTime(this.campaign.quantities[i].endDate);
		let campaignEndDay = this.toFormalTime(this.campaign.endDate);
		let quantityEndDay = this.toFormalTime(event.end._d.getTime());
		if(quantityEndDay != campaignEndDay){
			this.addDetailList(i);
		}else{
			this.campaign.quantities[i].endDate = this.campaign.endDate;
		}	
	}
	//设置时间不能小于当前时间
	filterMinTime(){
		let minTime;
		this.year = new Date().getFullYear();
		this.month = (new Date().getMonth()+1).toString();
		this.day = (new Date().getDate()).toString();
		if(this.month.length === 1){
			this.month = '0'+this.month;
		}
		if(this.day.length === 1){
			this.day = '0'+this.day;
		}
		minTime = this.month+'/'+this.day+'/'+this.year;
		return minTime;
	}

	//改变是否匀速
	changeSpeed(e){
		if(e.target.checked){
			this.campaign.uniform = '1';
		}else{
			this.campaign.uniform = '0';
		}
	}
	//选择落地页名称
	changeLandpageName(){
		for(let i=0;i<this.landpageArr.length;i++){
			if(this.campaign.landpageName == this.landpageArr[i].name){
				this.campaign.landpageId = this.landpageArr[i].id;
				this.campaign.landpageUrl = this.landpageArr[i].url;
				this.isCheck = this.landpageArr[i].monitorUrl ? "是" : "否";
				this.checkCodes = this.landpageArr[i].codes;
			}
		}
	}
	//是否添加频次
	isfrequency(e){
		let text = e.target.options[e.target.selectedIndex].text
		if(text != "无"){
			this.isFrequency = true;
		}else{
			this.campaign.frequency.timeType = undefined;
			this.campaign.frequency.number = undefined;
			this.isFrequency = false;
		}
	}
	
	//重置时间选择属性
	private reInitTimeplate(options:any,addObj:Object,optionsArr?:string): void{
		let index;

		const _doChange = () => {
			optionsArr ? this[optionsArr][index] = null : this[index] = null;
			for(let i in addObj){
				options[i] = addObj[i];
			}
			let that = this;
			setTimeout(() => {
				optionsArr ? this[optionsArr][index] = options : this[index] = options;
			},15);
		}

		if(!optionsArr){
			for(let i in this){
				if(options == this[i]){
					index = i;
					_doChange();
				}		
			}
		}else{
			for(let i=0;i< this[optionsArr].length;i++){
				if(options == this[optionsArr][i]){
					index = i;
					_doChange();
				}		
			}
		}
			
	}

	//数据格式验证

	private _Validate(){
		//频次控制勾选则每项必填
		if(this.campaign.frequency.controlObj || this.campaign.frequency.timeType || this.campaign.frequency.number){
			if(!this.campaign.frequency.controlObj || !this.campaign.frequency.timeType || !this.campaign.frequency.number){
				this.myModalService.alert(this.chineseService.config.IF_ADDFREQUENCY_MUST_PERFECT_MESSAGE);
				return false;
			}
		}
		return true;
	}


	/**
	 *  定向页面
	 */

	private projectId: string;

	private project: Project;

	campaignid:string;

	errorMessage:string;

	campaignTarget = new CampaignTarget();

	campaigns:Campaign[] = [];

	selectInfo = {};

	selectorNames = ["adType","network","operator","device","os"];

	appAmount = "0";

	regionNames = "";

	weekRangeNames = "";

	private populations = [];

	disPopulation: Population = new Population();

	population: Population = new Population();

	populationFlag = -1;

	currentCampaign = "";

	private isRegion: boolean = true;

	private adTypeCount: number = 3;

	private showTargetDetail = false;

	private audits = [];

	private showAdx = false;

	private isAppOpen = false;


	@ViewChild("appModal")
	appModal:ModalComponent;
	@ViewChild(ModalAppComponent)
	appComponent:ModalAppComponent;

	@ViewChild("weekRangeModal")
	weekRangeModal:ModalComponent;
	@ViewChild(ModalWeekRangeComponent)
	weekRangeComponent:ModalWeekRangeComponent;

	@ViewChild("regionModal")
	regionModal:ModalComponent;
	@ViewChild(ModalRegionComponent)
	regionComponent:ModalRegionComponent;

	//打开APP窗口并订阅提交
	openAppModal() {
		if(this.isAppOpen){
			return;
		}
		this.isAppOpen = true;
		this.advertiserService.get(this.project.advertiserId).subscribe(
			result => {
				if(result.head.httpCode === 200){
					let advertiser = result.body;
					let hasAdx;
					// 判断是否有可用adx
					for(let i = 0;i < advertiser.audits.length;i++){
						if(advertiser.audits[i].enable === "01" && advertiser.audits[i].status === "03"){
							hasAdx = true;
							this.audits.push(advertiser.audits[i]);
						}				
					}
					// 如果有可用adx则打开选择app组件
					if(hasAdx){
						this.showAdx = true;
						this.appModal.open()
							.then(()=>{
								this.appComponent.subject.subscribe({
									next: (obj:any) => {
										this.campaignTarget.adx = obj.adx;
										this.campaignTarget.include = obj.include;
										this.campaignTarget.exclude = obj.exclude;
										this.appAmount = obj.amount;
										this.appModal.close();
										this.isAppOpen = false;
										this.showAdx = false;
										this.audits = [];
									}
								})
							})
					}else{
						this.myModalService.alert(this.chineseService.config.NOT_APP_PLEASE_GOTO_ADVERTISER);
					}
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
		
	}

	//提交选择APP
	appModalSubmit(){	
		this.appComponent.submit();
	}
	appModalcancel(){
		this.appModal.close();
		this.isAppOpen = false;
		this.showAdx = false;
		this.audits = [];
	}

	//打开地域窗口并订阅提交
	openRegionModal() {
		this.regionModal.open()
			.then(()=>{
				let selectedArea = [];
				if(this.campaignTarget.regions)
					for(let i = 0,len=this.campaignTarget.regions.length;i<len;i++)
						selectedArea.push(this.campaignTarget.regions[i].id);
				this.regionComponent.regionData = selectedArea;
				this.regionComponent.getRegion();
				let waitResult = this.regionComponent.$result.subscribe(data => {
					this.campaignTarget.regions = data;
					this.regionNames = this.getNames(data);
					if(!this.regionNames){
						this.isRegion = true;
					}
					this.regionModal.close();
					waitResult.unsubscribe();
				});
			})
	}
	private regionCancel(){
		this.regionComponent.cancel();
		this.regionModal.close();
	}

	getNames(data){
		let str = "";
		if(!data)
			return str;
		for(let i=0,len=data.length;i<len;i++)
			str += data[i].name+(i==len-1?"":",");
		return str;
	}

	//提交选择地域
	regionModalSubmit(){
		this.regionComponent.submit();
	}

	//打开时段窗口并订阅提交
	openWeekRangeModal() {
		this.weekRangeModal.open()
			.then(()=>{
				if(this.campaignTarget.time)
					this.weekRangeComponent.init(this.campaignTarget.time);
				let waitResult = this.weekRangeComponent.$result.subscribe(data => {
					this.campaignTarget.time = data;
					this.weekRangeComponent.timeRange = [];
					this.weekRangeNames = "";
					let timeRange = this.weekRangePickerService.getTimeRange(this.weekRangeComponent.weekRangePicker.getData(),true);
					let weekTitles = this.chineseService.config.WEEKS_ARRAY_ONE_SEVEN;
					for(let i=0,len=timeRange.length;i<len;i++){
						this.weekRangeNames += weekTitles[timeRange[i].week] + (timeRange[i].ranges.join(",")) + (i == len-1 ? "" :";")
					}
					this.weekRangeComponent.weekRangePicker.setData(this.weekRangePickerService.getInitData());
					waitResult.unsubscribe();
					this.weekRangeModal.close();
				});
			})
	}

	//提交选择地域
	weekRangeModalSubmit(){
		this.weekRangeComponent.submit();
	}

	//初始化select数据
	initSelectStatus(targets){
		for(let i=0,len=targets.length;i<len;i++){
			let item = targets[i],
				selectData = this.codeService.get(item+"Target");
			this.selectInfo[item] = { data:selectData };
			
			if(i == 0){
				//广告位选择初始化
				for(let j=0,len=selectData.length;j<len;j++){
					if(this.campaignTarget[item] && this.campaignTarget[item].indexOf(selectData[j].value) == -1){
						selectData[j].selected = false;
						//统计广告数量
						this.adTypeCount --;
					}else{
						selectData[j].selected = true;
					}			
				}
			}else{
				for(let j=0,len=selectData.length;j<len;j++){
					if(this.campaignTarget[item] && this.campaignTarget[item].indexOf(selectData[j].value) !== -1)
						this.selectInfo[item].flag = selectData[j].selected = true;
					else
						selectData[j].selected = false;
				}
						
				this.selectInfo[item].flag = (this.campaignTarget[item] && this.campaignTarget[item].length != 0) ? true : false;
			}
			
		}
	}

	getPopulations(){
		this.polationService.list().subscribe(
			result => {
				if(result.head.httpCode == 200){
					let items = result.body.items || [];
					for(let i=0;i<items.length;i++){
						this.populations[i] = items[i];
					}
					this.fireTarget();
				}else if(result.head.httpCode == 404){
					this.populationFlag = -1;
				}
			},
			error => this.errorMessage = <any>error
		)
	}

	//获取所有活动
	getCampaigns(){
		this.campaignService.list({projectId: this.projectId}).subscribe(
			resultInfo => {
				if(resultInfo.head.httpCode == 200){
					for(let i=0,len=resultInfo.body.items.length;i<len;i++)
						if(resultInfo.body.items[i].id === this.campaignid){
							resultInfo.body.items.splice(i,1);
							break;
						}
					this.campaigns = resultInfo.body.items;
				}
			},
			error => this.errorMessage = <any>error
		)
	}

	//根据选择的活动导入定向
	importTargets(campaign){
		this.campaignTarget = campaign.target;
		this.CampaignTargetBegin(true);
	}

	//获取定向数据，成功后初始化select数据
	initCampaigntarget(){	
		if(this.isCopy){
			this.campaignTarget = JSON.parse(window.sessionStorage.getItem("campaign")).target;
		}else{
			this.campaignTarget = this.campaign.target;
		}
		// 获取项目
		this.projectId = this.campaign.projectId;
		this.getRuleGroups();
		this.getCampaigns();
		this.projectService.get(this.projectId).subscribe(
			result => {
				if(result.head.httpCode === 200){
					this.project = result.body;
				}else{
					this.myModalService.alert(result.body.message)
				}
			},
			error => {
				this.myModalService.alert(error.message)
			}
		)
		this.CampaignTargetBegin(false);
	}
	private getRuleGroups(){
		this.projectService.listRuleGroups({projectId: this.projectId}).subscribe(
			result => {
				this.ruleGroups = result.body.items;
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}

	private CampaignTargetBegin(isImport){
		if(!isImport){
			this.isEdit && this.getAmount();
		    this.isCopy && this.getAmount();
		}else{
			this.getAmount();
		}			
		if(!this.campaignTarget.regions){
			this.isRegion = true;
		}else{
			this.isRegion = false;
		}	
		this.setTarget();	
		this.populationInit();
	}
	
	// 编辑页面人群初始化
	private populationInit(): void{
		if(!this.campaignTarget.population){
			this.populationFlag = -1;
		}else{
			if(this.campaignTarget.population.type == "01"){
				this.populationFlag = 1;
			}else{
				this.populationFlag = 0;
			}
			let id = this.campaignTarget.population.id;
			for(let i=0;i<this.populations.length;i++){
				if(id == this.populations[i].id){
					this.population = this.populations[i];
				}
			}
		}
	}
	// 进入页面时高级选项是否展开
	private confirmTargetDetail(){
		this.showTargetDetail = this.campaignTarget.device || this.campaignTarget.network || this.campaignTarget.operator || this.campaignTarget.os || this.campaignTarget.population ? true : false;
	}
	setTarget(){
		this.confirmBlankObj(this.campaignTarget.population) && (delete this.campaignTarget.population);
		this.campaignTarget = this.removeBlankAttribute(this.campaignTarget);
		this.confirmTargetDetail();
		this.isRegion = this.campaignTarget.regions ? false : true;
		this.regionNames = this.getNames(this.campaignTarget.regions);
		if(!this.campaignTarget.time){
			let week = [];
			for(let i=0;i<168;i++){
				let result = Math.floor(i/24) + 1;
				let remainder = i%24;
				let remainderStr = remainder + "";
				remainderStr = remainderStr.length === 1 ? "0" + remainderStr : remainderStr;
				week[i] = "0" + result + remainderStr;
			}
			this.campaignTarget.time = week;
		}
		this.weekRangeComponent.init(this.campaignTarget.time);
		let timeRange = this.weekRangePickerService.getTimeRange(this.weekRangeComponent.weekRangePicker.getData(),true);
		let weekTitles = this.chineseService.config.WEEKS_ARRAY_ONE_SEVEN;
		this.weekRangeNames = "";
		for(let i=0,len=timeRange.length;i<len;i++){
			this.weekRangeNames += weekTitles[timeRange[i].week] + (timeRange[i].ranges.join(",")) + (i == len-1 ? "" :";")
		}		
		this.initSelectStatus(this.selectorNames);
	}

	//将select数据转变成字符串数组格式以适配api接口
	convertSelect(data):Array<any>{
		let resultArray = [];
		for(let i=0,len=data.length;i<len;i++){
			if(data[i].selected == true)
				resultArray.push(data[i].value);
		}
		return resultArray;
	}

	saveTarget(){
		for(let v in this.selectInfo){
			this.campaignTarget[v] = this.convertSelect(this.selectInfo[v].data);
		}
		if(this.campaignTarget.regions){
			this.campaignTarget.region = [];
			for(let i=0,len=this.campaignTarget.regions.length;i<len;i++)
				this.campaignTarget.region[i] = this.campaignTarget.regions[i].id;
		}else{
			this.campaignTarget.region = [];
		}
		if(this.populationFlag == -1){
			delete this.campaignTarget.population;
		}else{
			this.campaignTarget.population = new TargetPopulation();
			this.campaignTarget.population.id = this.population.id;
			if(this.populationFlag == 1 && this.population){
				this.campaignTarget.population.type = "01";
			}else{
                this.campaignTarget.population.type = "02";
			}
		}
		this.campaign.target = this.campaignTarget;
	}

	//根据flag值判断全选
	setAllSelect(name,isTrue){
		for(let i=0,len=this.selectInfo[name].data.length;i<len;i++){
			this.selectInfo[name].data[i].selected = isTrue;
		}
	}

	//点击多选框处理方法，保证最后至少一个选中并设置flag为true
	selectClick(selectItem,index,$event){

		let count = 0;

		for(let i=0,len=selectItem.data.length;i<len;i++){
			if(selectItem.data[i].selected)
				count++;
		}
		if(count <= 1 && selectItem.data[index].selected == true){
			$event.preventDefault();
		}
		
		selectItem.flag = true;
	}

	//保存
	save(){	
		if(this.appAmount === "0"){
			this.myModalService.alert(this.chineseService.config.APP_AMOUNT_ISNOT_ZERO);
			return;
		}
		if(!this.campaignTarget.time || this.campaignTarget.time.length==0){
			this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_CAMPAIGN_RANGE);
			return;
		}
		this.saveTarget();
		this.baseSave(["/home/project/campaign/list", this.campaign.projectId]);
	}

	//取消
	cancel(){
		this.location.back();
	}

	//保存并跳转至创意列表页
	creativeUploadList(){
		if(this.appAmount === "0"){
			this.myModalService.alert(this.chineseService.config.APP_AMOUNT_ISNOT_ZERO);
			return;
		}
		if(!this.campaignTarget.time || this.campaignTarget.time.length==0){
			this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_CAMPAIGN_RANGE);
			return;
		}
		this.saveTarget();
		this.baseSave(["home/project/creativeUploadAdd",undefined]);
	}
	//活动名称过长截取
	private cutLongstring(name: string): string{
		let str;
		if(name.length > 13){
			str = name.slice(0,12)+"...";
		}else{
			str = name;
		}
		return str;
	}
	//是否地域定向
	private isregion(): void{
		this.regionNames = '';
		this.campaignTarget.regions = undefined;

	}

	//广告位选择切换，至少选择一个
	private isselected(v): void{
		if(v.selected){
			this.adTypeCount ++;
		}else{
			this.adTypeCount --;
		}
		if(this.adTypeCount == 0){
			this.myModalService.alert(this.chineseService.config.ATLEAST_CHOICE_ADSENSE);
			this.adTypeCount ++;
			setTimeout(() => {
				v.selected = !v.selected;
			},1)
		}
	}

	private toggleTargetDetail(){
		this.showTargetDetail = !this.showTargetDetail;
	}

	// 移除空属性
	private removeBlankAttribute(obj){
		for(let i in obj){
			if(obj[i] === undefined || obj[i] == {}){
				delete obj[i];
			}
		}
		return obj;
	}
	// 判断空对象
	private confirmBlankObj(obj){
		for(let i in obj){
			return false;
		}
		return true;
	}
	// 获取app数量
	private getAmount(){
		this.appService.getAmount({
			adx: this.campaignTarget.adx,
			include: this.campaignTarget.include,
			exclude: this.campaignTarget.exclude
		}).subscribe(
			result => {
				this.appAmount = result.body.amount;
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}
}