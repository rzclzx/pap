import { Component,OnInit,ViewChild,TemplateRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";

import { CreativeService } from "../../services/creative.service";
import { CampaignService } from "../../services/campaign.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";

import { Creative } from "../../models/creative.model";
import { Page } from "../../models/page.model";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "creative-upload-list",
	templateUrl: "./dist/client/views/creative/creativeUploadList.html"
})

export class CreativeUploadListComponent implements OnInit {

	baseFileUrl;

	private errorMessage:string;

	public columns = [];

	public campaignId:string;

	public creatives:Array<Creative> = [];

	public editPriceList = [];

	public allCheck:boolean;

	public selected:Array<any> = [];

	public startDate: number;

	public endDate: number;

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

	public detailInfo = {
		"01":[{ title: this.chineseService.config.IMAGE, name:"imagePath"}],
		"02":[
			{ title: this.chineseService.config.IMAGE, name:"imagePath" },
			{ title: this.chineseService.config.VIDEO, name:"videoPath", isVideo:true},
		],
		"03":[
			{ title: "icon", name:"iconPath" },
			{ title: this.chineseService.config.IMAGE + "1", name:"image1Path"},
			{ title: this.chineseService.config.IMAGE + "2", name:"image2Path"},
			{ title: this.chineseService.config.IMAGE + "3", name:"image3Path"},
		],
	}
	private toType = {
		"01": "image",
		"02": "video",
		"03": "infoflow"
	}

	public currentDtlType:string;

	public currentDetail = {};

	public initvalue: string;

	public options = {
		locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
		autoUpdateInput: false
	}

	@ViewChild("editTmpl") editTmpl: TemplateRef<any>;
	@ViewChild("appsTmpl") appsTmpl: TemplateRef<any>;
	@ViewChild("detailModal") detailModal: ModalComponent;
	@ViewChild("datatable") datatable;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private location: Location,
		private creativeService:CreativeService,
		private campaignService:CampaignService,
		private myModalService: MyModalService,
		private chineseService: ChineseService,
		private publicService: PublicService
	) {}
	private urlInit(){
		this.baseFileUrl = eval(profiles + ".imgurlHref");
	}
	ngOnInit(){
		this.urlInit();
		this.timeInit();
		this.initvalue = this.toFormalTime(this.startDate)+" - "+this.toFormalTime(this.endDate);
		if(this.route.snapshot.params["campaignid"]){
			this.campaignId = this.route.snapshot.params["campaignid"];
		}
		this.refreshTable();
	}
	private timeInit(){
		let obj = this.publicService.getTodayStartandEnd();
		this.startDate = this.route.snapshot.params["startDate"] ? parseInt(this.route.snapshot.params["startDate"]) : obj.startDate;
		this.endDate = this.route.snapshot.params["endDate"] ? parseInt(this.route.snapshot.params["endDate"]) : obj.endDate;
	}
	onSelect(event){
		if(!event.selected)
			return;
		this.allCheck = event.selected.length == this.creatives.length ? true : false;
	}
	//选择时间
	selectedDate(e){
		this.startDate = e.startDate._d.getTime();
        this.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.initvalue = this.toFormalTime(this.startDate)+" - "+this.toFormalTime(this.endDate);
		this.refreshTable();
	}

	//更改价格
	switchWrite(creative){
		if(!creative.isWrite){
			creative.isWrite = true;
		}
	}
	switchUnWrite(creative,e){
		if(!/^([1-9]*[1-9][0-9]*(.[0-9]{0,2})?|0.[0-9]?[1-9]|0.[1-9][0-9]?)$/.test(e.target.value) || !/^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/.test(e.target.value)){
			this.myModalService.alert(this.chineseService.config.INT_OR_TWO_FLOAT);
			creative.isWrite = false;
			return;
		}
		if(e.target.value.toString().length >6){
			this.myModalService.alert(this.chineseService.config.PRICE_ISNOT_EXTEND_SIX_MEASURE);
			creative.isWrite = false;
			return;
		}else{
			this.creativeService.changePrice(creative.id,e.target.value)
				.subscribe(
				result => {
					if (result.head.httpCode == 204) {
						creative.price = e.target.value;		
						this.refreshTable();				
					}else{
						this.myModalService.alert(result.body.message);
					}
					creative.isWrite = false;
				},
				error => {
					this.myModalService.alert(error.message);
					creative.isWrite = false;
				});
		}
		
	}

	//全选切换
	private allToggle(table,allcheck,data){
		table.selected.splice(0,table.selected.length);
		if(allcheck){
			let start = table.offset*table.pageSize,
				end = (table.offset+1)*table.pageSize > table.rowCount ? table.rowCount : (table.offset+1)*table.pageSize;
			for(let i=start;i<end;i++){
				table.selected.push(data[i])
			}
		}
	}

	private delSelectedCreative(selected){
		if (selected.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
			return;
		}
		let ids = [];
		for(let i=0,len=selected.length;i<len;i++){
			ids.push(selected[i].id);
		}
		let subject;
		if(ids.length == 1){
			subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.WHAT);
		}else{
			subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.CREATIVE + this.chineseService.config.WHAT);
		}
		subject.subscribe({
			next: (data) => {
				if(data){
					this.creativeService.delete(ids.join(","))
						.subscribe(
							result => {
								if (result.head.httpCode == 204) {
									this.myModalService.alert(this.chineseService.config.SUCCESS);
								} else {
									this.myModalService.alert(result.body.message);
								}
								this.refreshTable();
							},
							error => {
								this.myModalService.alert(error.message);
							}
						);
				}
			}
		})

	}

	openDetail(id:string, type:string){
		this.currentDtlType = type;
		this.creativeService.get(id).subscribe(
			result => {
				if (result.head.httpCode == 200) {
					this.currentDetail = result.body;
				}
			},
			error => {
				this.myModalService.alert(error.message)
			}
		);
		this.detailModal.open();

	}

	synchronizeCreative(id,status){
		this.creativeService.synchronize(id).subscribe(
			result => {
				if (result.head.httpCode == 204) {
					this.myModalService.alert(this.chineseService.config.SUCCESS);
				} else {
					this.myModalService.alert(result.body.message);
				}
				this.refreshTable();
			},
			error => {
				this.myModalService.alert(error.message)
			}
		);
	}

	// 刷新表格数据
	private refreshTable(obj?) {
		let options = {
			campaignId: this.campaignId,
			startDate: this.startDate,
			endDate: this.endDate,
			pageNo: this.page.pageNo + 1,
			pageSize: this.page.pageSize
		}
		if(obj){
			for(let i in obj){
				options[i] = obj[i];
			}
		}
		this.creativeService.list(options)
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let rows = [];
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
						}
						this.creatives = rows;
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							if(!this.creatives[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
								this.page.pageNo--;
							}
						}
					}else if(result.head.httpCode == 404){
						this.creatives = [];
					}
				},
				error => this.errorMessage = <any>error);
		// 清除已选择数组
		this.selected = [];
		this.allCheck = false;
	}

	//取消
	cancel(){
		this.location.back();
	}

	editCreative(row){
		this.router.navigate(["home/project/creativeUploadEdit",row.campaignId,this.toType[row.type],row.id]);
	}

	creativeUploadAdd(){		
		this.router.navigate(["home/project/creativeUploadAdd",this.campaignId,"image"]);					
	}
	onPage(event){
		this.page.pageNo = event.offset;
		this.refreshTable();
	}

	//将时间戳转换为日期
	toFormalTime(time: number){
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
	private outerSync(e): void{
		this.syncCreative(this.selected);
	}
	private outerAudit(e): void{
		this.auditCreative(this.selected);
	}
	private update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo:1});
	}
	
	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.datatable,value,this.creatives);
	}
	private outerDelete(e): void{
		this.delSelectedCreative(this.selected);
	}
	private auditCreative(arr): void{
		if(arr.length === 0){
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		}else{
			let ids = [];
			for(let i=0;i<arr.length;i++){
				ids.push(arr[i].id);
			}
			let str = ids.join(",");
			this.creativeService.audits(str).subscribe(
				result => {
					if(result.head.httpCode === 204){
						this.myModalService.alert(this.chineseService.config.AUDIT_SUCCESS);
						this.refreshTable();
					}else{
						this.myModalService.alert(result.body.message);
					}
				},
				error => {
					this.myModalService.alert(error.message);
				}
			)
		}
		
	}
	private syncCreative(arr): void{
		if(arr.length === 0){
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		}else{
			let ids = [];
			for(let i=0;i<arr.length;i++){
				ids.push(arr[i].id);
			}
			let str = ids.join(",");
			this.creativeService.synchronizes(str).subscribe(
				result => {
					if(result.head.httpCode == 204){
						this.myModalService.alert(this.chineseService.config.SYNC_SUCCESS)
						this.refreshTable();
					}else{
						this.myModalService.alert(result.body.message);
					}
				},
				error => {
					this.myModalService.alert(error.message)
				}
			)
		}
		
	}
	//开关切换
	private switch(e,row){
		e.preventDefault();
		let value = e.target.checked;
		if(value){
			this.changeStatus(row.id,"01");
		}else{
			this.changeStatus(row.id,"02");
		}
	}
	// 改变状态
	private changeStatus(id,enable){
		this.creativeService.enable(id,{enable:enable}).subscribe(
			result => {
				if (result.head.httpCode == 204){
					this.refreshTable();
				}else{				
					this.refreshTable();
					this.myModalService.alert(result.body.message)
				}
					
			},
			error => {
				this.myModalService.alert(error.message);
			});
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
	// 跳转活动列表页面
	private gotoCampaignlist(){
		this.campaignService.get(this.campaignId).subscribe(
			result =>{
				if(result.head.httpCode === 200){
					let obj = result.body || {};
					this.router.navigate(["/home/project/campaign/list",obj.projectId,this.startDate,this.endDate]);
				}
			}
		)	
	}
}