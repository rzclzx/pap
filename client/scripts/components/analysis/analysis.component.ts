// / <reference path="../../../../node_modules/echarts/echarts.d.ts" />
import { Component, OnInit, ViewChild, TemplateRef,Host,Inject,forwardRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { DaterangepickerConfig } from "ng2-daterangepicker";

import * as echarts from "echarts";

import { DataService } from "../../services/data.service";
import { AdvertiserService } from "../../services/advertiser.service";
import { ProjectService } from "../../services/project.service";
import { CampaignService } from "../../services/campaign.service";
import { CreativeService } from "../../services/creative.service";
import { CutStringService } from "../../services/cutstring.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";
import { MainComponent } from "../main.component";

@Component({
	selector: "analysis",
	templateUrl: "./dist/client/views/analysis/analysis.html",
})

export class AnalysisComponent implements OnInit {

	private errorMessage:string = "";

	private advertiser;

	private advertisers = [];

	private project;

	private projects;

	private campaign;

	private campaigns;

	private creative;

	private creatives;

	private advertiserId;

	private projectId;

	private campaignId;

	private creativeId;

	private initvalue;

	public options = {
		locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
		autoUpdateInput: false
	}

	private startDate: number;

	private endDate: number;

	private timeline = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00",
					"08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
					"16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
					
	private timeMap = {"00:00" : "00:00:00~00:59:59", "01:00" : "01:00:00~01:59:59", "02:00" : "02:00:00~02:59:59", 
			"03:00" : "03:00:00~03:59:59", "04:00" : "04:00:00~04:59:59", "05:00" : "05:00:00~05:59:59", 
			"06:00" : "06:00:00~06:59:59", "07:00" : "07:00:00~07:59:59", "08:00" : "08:00:00~08:59:59", 
			"09:00" : "09:00:00~09:59:59", "10:00" : "10:00:00~10:59:59", "11:00" : "11:00:00~11:59:59", 
			"12:00" : "12:00:00~12:59:59", "13:00" : "13:00:00~13:59:59", "14:00" : "14:00:00~14:59:59", 
			"15:00" : "15:00:00~15:59:59", "16:00" : "16:00:00~16:59:59", "17:00" : "17:00:00~17:59:59", 
			"18:00" : "18:00:00~18:59:59", "19:00" : "19:00:00~19:59:59", "20:00" : "20:00:00~20:59:59", 
			"21:00" : "21:00:00~21:59:59", "22:00" : "22:00:00~22:59:59", "23:00" : "23:00:00~23:59:59"};

	private lastColor = ["#70bff0","#b2daf9","#a6e5f1","#90d7eb","#78cdd0"];

	private type = [
		{ name:this.chineseService.config.IMPRESSIONAMOUNT, value:"impressionAmount" },
		{ name:this.chineseService.config.CLICKAMOUNT, value:"clickAmount" },
		{ name:this.chineseService.config.CLICKRATE, value:"clickRate" },
	]

	private currentType;

	private times;
	private regions;
	private operators;
	private systems;
	private networks;

	@ViewChild("timeCharts") timeCharts;
	@ViewChild("regionCharts") regionCharts;
	@ViewChild("systemCharts") systemCharts;
	@ViewChild("operatorCharts") operatorCharts;
	@ViewChild("networkCharts") networkCharts;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private dataService:DataService,
		private advertiserService:AdvertiserService,
		private projectService:ProjectService,
		private campaignService:CampaignService,
		private creativeService:CreativeService,
		private cut: CutStringService,
		private DaterangepickerConfig:DaterangepickerConfig,
		private chineseService: ChineseService,
		private publicService: PublicService,
		@Host() @Inject(forwardRef(()=> MainComponent)) mainComponent:MainComponent
	) {
		mainComponent.currentInit();
		this.currentType = this.type[0];
		this.advertiserId = route.snapshot.params["advertiserId"]?route.snapshot.params["advertiserId"]:undefined;
		this.projectId = route.snapshot.params["projectId"]?route.snapshot.params["projectId"]:undefined;
		this.campaignId = route.snapshot.params["campaignId"]?route.snapshot.params["campaignId"]:undefined;
		this.creativeId = route.snapshot.params["creativeId"]?route.snapshot.params["creativeId"]:undefined;
		
	}

	ngOnInit() {
		this.timeInit();
		this.fromFlowListInit();
	}
	private timeInit(){
		let obj = this.publicService.getTodayStartandEnd();
		this.startDate = this.route.snapshot.params["startDate"] ? parseInt(this.route.snapshot.params["startDate"]) : obj.startDate;
		this.endDate = this.route.snapshot.params["endDate"] ? parseInt(this.route.snapshot.params["endDate"]) : obj.endDate;
	}

	selectedDate(e){
		this.startDate = e.startDate._d.getTime();
        this.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		let modalObj = {
			modal: undefined,
			name: undefined
		};
		if(this.campaign){
			modalObj.modal = this.campaign;
			modalObj.name = "campaignId"
		}else if(this.project){
			modalObj.modal = this.project;
			modalObj.name = "projectId";
		}else if(this.advertiser){
			modalObj.modal = this.advertiser;
			modalObj.name = "advertiserId";
		}else{
			modalObj = undefined;
		}
		if(modalObj){
			this.refresh(modalObj.modal,modalObj.name);
		}
	}

	typeChange(item){
		if(this.times && this.times.length)
			this.initCharts(this.timeCharts,this.getTimeOption(this.times,item));
		if(this.regions && this.regions.length)
			this.initCharts(this.regionCharts,this.getRegionOption(this.regions,item));
		if(this.operators && this.operators.length)
			this.initCharts(this.operatorCharts,this.getPieOption(this.operators,item,this.chineseService.config.OPERATOR));
		if(this.systems && this.systems.length)
			this.initCharts(this.systemCharts,this.getPieOption(this.systems,item,this.chineseService.config.OPERATOR));
		if(this.networks && this.networks.length)
			this.initCharts(this.networkCharts,this.getPieOption(this.networks,item,this.chineseService.config.NETWORK));
	}

	refresh(model,name){
		if(!model)
			return;
		if(name == "advertiserId"){
			this.getProjectList({startDate:this.startDate,endDate:this.endDate,"advertiserId":this.advertiser.id});
		}else if(name == "projectId"){
			this.getCampaignList({startDate:this.startDate,endDate:this.endDate,"projectId":this.project.id});
		}else if(name == "campaignId"){
			this.getCreativeList({startDate:this.startDate,endDate:this.endDate,"campaignId":this.campaign.id});
		}
		this.getData("times",model,name).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.times = result.body.items;
					let times = [];
					for(let i = 0;i < this.times.length;i++){
						times[this.times[i].time*1] = this.times[i];
					}
					this.times = times;
					this.initCharts(this.timeCharts,this.getTimeOption(this.times,this.currentType));
				}
			},
			error => this.errorMessage = <any>error
		);
		this.getData("regions",model,name).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.regions = result.body.items;
					this.initCharts(this.regionCharts,this.getRegionOption(this.regions,this.currentType));
				}
			},
			error => this.errorMessage = <any>error
		);
		this.getData("operators",model,name).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.operators = result.body.items;
					this.initCharts(this.operatorCharts,this.getPieOption(this.operators,this.currentType,this.chineseService.config.OPERATOR));
				}
			},
			error => this.errorMessage = <any>error
		);
		this.getData("systems",model,name).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.systems = result.body.items;
					this.initCharts(this.systemCharts,this.getPieOption(this.systems,this.currentType,this.chineseService.config.SYSTEM));
				}
			},
			error => this.errorMessage = <any>error
		);
		this.getData("networks",model,name).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.networks = result.body.items;
					this.initCharts(this.networkCharts,this.getPieOption(this.networks,this.currentType,this.chineseService.config.NETWORK));
				}
			},
			error => this.errorMessage = <any>error
		);
		
	}

	getData(type,model,name){
		let params = <any>{};
		params[name] = model.id;
		params.startDate = this.startDate;
		params.endDate = this.endDate;
		return this.dataService.list(type,params);
	}

	//根据id找出单个对象
	getObjFromArr(id,arr){		
		for(let i=0;i<arr.length;i++){
			if(id == arr[i].id){
				return arr[i];
			}
		}
	}

	getAdvertiserList(options?){
		this.advertiserService.list(options?options:undefined).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.advertisers = result.body.items;
					if(this.advertiser){
						this.getProjectList({startDate:this.startDate,endDate:this.endDate,"advertiserId":this.advertiser.id});
					}
					
				}
			},
			error => this.errorMessage = <any>error
		);
	}

	getProjectList(options){

		this.projectService.list(options).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.projects = result.body.items;
					if(this.project){
						this.getCampaignList({startDate:this.startDate,endDate:this.endDate,"projectId":this.project.id});
					}
				}
			},
			error => this.errorMessage = <any>error
		);
		
	}

	getCampaignList(options){
		this.campaignService.list(options).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.campaigns = result.body.items;
					if(this.campaign){
						this.getCreativeList({startDate:this.startDate,endDate:this.endDate,"campaignId":this.campaign.id});
					}
				}
			},
			error => this.errorMessage = <any>error
		)
	}

	getCreativeList(options){
		this.creativeService.list(options).subscribe(
			result => {
				if(result.head.httpCode == 200){
					this.creatives = result.body.items;

				}
			},
			error => this.errorMessage = <any>error
		)
	}

	initCharts(echart,option){
		let myCharts = echarts.init(echart.nativeElement);
		myCharts.setOption(option);
	}

	getPieOption(operatorData,type,name){
		var data = [], series = [], line = [];
		for(let i=0,len=operatorData.length;i<len;i++){
			if(operatorData[i][type.value]){
				data.push({
					value: operatorData[i][type.value],
					name: operatorData[i]["name"]
				});
				line.push(operatorData[i]["name"]);
			}
			
		}
		return {
			color:["#2E89DF","#46AA38","#F1D429","#E37712","#D83308",],
			tooltip : {
				trigger: "item",
				backgroundColor:"rgba(38, 45, 64, .8)",
				formatter:function(param){
					let res = "<div>"+
							"<strong>"+param.seriesName+" : "+param.name+"</strong><br/>"+
							type.name+" : "+(type.value === "clickRate" ? (param.value*1000).toFixed(2) : param.value)+(type.value === "clickRate" ? "‰" : "")+"<br/>"+
							"占比 : "+param.percent+"%"+
							"<div>";
					return res;
					 //return "暂无数据";
				}
			},
			clickable:false,
			legend: {
				orient : "vertical",
				left : "left",
				data:line
			},
			calculable : false,
			series : [{
					name:name,
					type:"pie",
					hoverAnimation:false,
					selectedMode:"single",
					radius : [0.1, 160],
					clickable:false,
					itemStyle : {
						normal : {
							label : {
								show:true,
								position : "outer"
							}
						}
					},
					data:data
				},],
			backgroundColor:"rgba(255,255,255,1)"
		};
	}

	getRegionOption(regionData,type){
		let that = this;
		var data = [], series = [], line = [];
		for(let i=0,len=regionData.length;i<len;i++){
			data.push(regionData[i][type.value]);
			line.push(regionData[i]["name"]);
		}
		series.push({
			name : type.name,
			type : "bar",
			smooth : true,
			data : data,
			markPoint : {
				data : [
					{type : "max", name: this.chineseService.config.MAX},
					{type : "min", name: this.chineseService.config.MIN}
				],
				symbolSize:function(a,b){
					return ((type.value === "clickRate" ? (a*1000).toFixed(2) : a)+(type.value === "clickRate" ? "‰" : "")).length*8+2*20;
				},
				label:{
					normal:{
						formatter:function(a){
							if(a instanceof Object){
								return (type.value === "clickRate" ? (a.value*1000).toFixed(2) : that.getEllipsis(a.value))+(type.value === "clickRate" ? "‰" : "");
							}
							return "";
						}
					}
				}
			},
		});
		return {
			color:this.lastColor,
			tooltip : {
				trigger: "axis",
				backgroundColor:"rgba(38, 45, 64, .8)",
				textStyle:{
					fontFamily:"Microsoft Yahei"
				},
				formatter: function(params) {
					if(params instanceof Array){
						var res = "<div>";
						res += "<strong>地区 : " + params[0].name + "</strong>"
						for (var i = 0, l = params.length; i < l; i++) {
							res += "<br/>" + params[i].seriesName + " : " + (type.value === "clickRate" ? (params[i].value*1000).toFixed(2) : params[i].value)+(type.value === "clickRate" ? "‰" : "");
						}
						res += "</div>";
						return res;
					}else{
						var res = "<div>";
						res += "<strong>"+params.name + "</strong>"
						+"<br/>" + params.seriesName + " : " + (type.value === "clickRate" ? (params.value*1000).toFixed(2) : params.value)+(type.value === "clickRate" ? "‰" : "");
						res += "</div>";
						return res;
					}
				}
			},
			dataZoom: {
				backgroundColor:"#eee",
				borderColor:"#b2d2f2",
				fillerColor:"#eff7ff",
				handleColor:"#008acd",
				handleSize:14,
				show: true,
				height:25,
				start : 30,
				end : 90
			},
			grid: {
				top:"100px",
				left: "50px",
				right: "50px",
				containLabel: true// 可以设为 true 防止标签溢出容器
			},
			xAxis : [
				{
					type : "category",
					boundaryGap : true,
					data : line,
				}],
			yAxis : [
				{
					type : "value",
				}
			],
			series : series,
			backgroundColor:"rgba(255,255,255,1)"
		};
	}


	getTimeOption(timeData,type){
		let that = this;
		var data = [], series = [];
		let timeMap = this.timeMap,timeline = this.timeline;
		for(let i=0,len=timeData.length;i<len;i++){
			data.push(timeData[i][type.value])
		}
		series.push({
			name : type.name,
			type : "bar",
			smooth : true,
			data : data,
			markPoint : {
				data : [
					{type : "max", name: this.chineseService.config.MAX},
					{type : "min", name: this.chineseService.config.MIN}
				],
				symbolSize:function(a,b){
					return ((type.value === "clickRate" ? (a*1000).toFixed(2) : a)+(type.value === "clickRate" ? "‰" : "")).length*8+2*20;
				},
				label:{
					normal:{
						formatter:function(a){
							if(a instanceof Object){
								return (type.value === "clickRate" ? (a.value*1000) : that.getEllipsis(a.value))+(type.value === "clickRate" ? "‰" : "");
							}
							return "";
						}
					}
				}
			},
		});
		return {
			color:this.lastColor,
			tooltip : {
				trigger: "axis",
				backgroundColor:"rgba(38, 45, 64, .8)",
				textStyle:{
					fontFamily:"Microsoft Yahei"
				},
				formatter: function(params) {
					if(params instanceof Array){
						var res = "<div>";
						res += "<strong>时间 : " + timeMap[params[0].name] + "</strong>"
						for (var i = 0, l = params.length; i < l; i++) {
							res += "<br/>" + params[i].seriesName + " : " + (type.value === "clickRate" ? (params[i].value*1000).toFixed(2) : params[i].value)+(type.value === "clickRate" ? "‰" : "");
						}
						res += "</div>";
						return res;
					}else{
						var res = "<div>";
						res += "<strong>"+params.name + "</strong>"
						+"<br/>" + params.seriesName + " : " + (type.value === "clickRate" ? (params.value*1000).toFixed(2) : params.value)+(type.value === "clickRate" ? "‰" : "");
						res += "</div>";
						return res;
					}
				}
			},
			dataZoom: {
				backgroundColor:"#eee",
				borderColor:"#b2d2f2",
				fillerColor:"#eff7ff",
				handleColor:"#008acd",
				handleSize:14,
				show: true,
				height:25,
				start : 30,
				end : 90
			},
			grid: {
				top:"100px",
				left: "50px",
				right: "50px",
				containLabel: true// 可以设为 true 防止标签溢出容器
			},
		   xAxis : [
				{
					type : "category",
					boundaryGap : true,
					data : timeline,
				}],
			yAxis : [
				{
					type : "value",
				}
			],
			series : series,
			backgroundColor:"rgba(255,255,255,1)"
		};
	}

	private getEllipsis(num: any): string{
		 let str = num.toString();
		 if(str.length >9){
			 str = str.slice(0,6);
			 str = str + "...";
			 return str;
		 }else{
			 return num;
		 }
	}

	//将时间戳转换为日期
	toFormalTime(time){
		time = parseInt(time);
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

	//监听从流量数据详细按钮进入的数据
	private fromFlowPromise(type:any,options: Object): Promise<any>{
		return new Promise((resolve,reject) => {
			this[type+"Service"].list(options)
			.subscribe(
				result => {
					if(result.head.httpCode == 200){
						this[type+"s"] = result.body.items;
						resolve(this[type+"s"]);
					}
				},
				error => this.errorMessage = <any>error
			);
		})
		
	}

	//流量数据详细按钮入口初始化
	private fromFlowListInit(): void{
		let count = 0;
		let obj = this.route.snapshot.params || {};
		let newArr = [];
		let sortObj = {
			"0":"advertiser",
			"1":"project",
			"2":"campaign",
			"3":"creative"
		}
		//对路由传过来的id参数计数
		for(let i in obj){
			if(i != "startDate" && i != "endDate"){
				count++;
			}
		}
		//将id按对象顺序传入数组当中
		for(let i=0; i<count;i++){
			newArr.push(sortObj[i]);
		}

		//只传入时间或者没传时间
		if(newArr.length == 0){
			this.getAdvertiserList({startDate:this.startDate,endDate:this.endDate});
		//只传入客户
		}else if(newArr.length == 1){
			this.fromFlowPromise("advertiser",{startDate:this.startDate,endDate:this.endDate})
					.then((data) => {
						this.advertiser = this.getObjFromArr(this.advertiserId,data);
						this.refresh(this.advertiser,"advertiserId");
					});
		//传入多条选项参数
		}else{
			for(let i =0;i<newArr.length;i++){	

				if(i == 0){
					this.fromFlowPromise("advertiser",{startDate:this.startDate,endDate:this.endDate})
						.then((data) => {
							this.advertiser = this.getObjFromArr(this.advertiserId,data);
						});
				}else if(i == newArr.length-1){
					let idName = sortObj[i-1]+"Id";
					let options = {startDate:this.startDate,endDate:this.endDate};
					options[idName] = this[sortObj[i-1]+"Id"];
					this.fromFlowPromise(sortObj[i],options)
						.then((data) => {
							this[sortObj[i]] = this.getObjFromArr(this[sortObj[i]+"Id"],data);
							this.refresh(this[sortObj[i]],[sortObj[i]+"Id"]);
						});
				}else{
					let idName = sortObj[i-1]+"Id";
					let options = {startDate:this.startDate,endDate:this.endDate};
					options[idName] = this[sortObj[i-1]+"Id"];
					this.fromFlowPromise(sortObj[i],options)
						.then((data) => {
							this[sortObj[i]] = this.getObjFromArr(this[sortObj[i]+"Id"],data);
						});
				}
			}
		}
		
		
	}
}