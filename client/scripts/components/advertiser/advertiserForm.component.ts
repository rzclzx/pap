import { Component,OnInit } from "@angular/core";
import { FileUploader } from "ng2-file-upload"
import { Router,ActivatedRoute,Params } from "@angular/router";

import "rxjs/add/operator/switchMap";

import { Advertiser } from "../../models/advertiser.model";
import { Industry } from "../../models/Industry.model";

import { AdvertiserService } from "../../services/advertiser.service";
import { IndustryService } from "../../services/industry.service";
import { ValidationService } from "../../services/validation.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "advertiser-form",
	templateUrl: "./dist/client/views/advertiser/advertiserForm.html"
})

export class AdvertiserFormComponent implements OnInit {

	private advertiser: Advertiser = new Advertiser();

	private isShowADX: boolean = false;

	private advertiserAdx: Array<any> = [];

	private validDate;

	private baseUrl: string;

	private baseImgUrl: string;

	private uploader: any;

	private advertiserId: string;

	private todayTime: number;

	private isEdit: boolean;

	private adxNames: string = "";

	private industries: Industry;

	private formalValidDate: string;


	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private advertiserService: AdvertiserService,
		private industryService: IndustryService,
		private validationService: ValidationService,
		private myModalService: MyModalService,
		private chineseService: ChineseService,
		private publicService: PublicService
	) {}

	ngOnInit() {	
		this.dateInit();
	}
	// 数据初始化
	private dateInit(){
		this.getIndustries();
		this.baseImgUrl = eval(profiles + ".imgurlHref");
		this.baseUrl = eval(profiles + ".urlHref");
		this.advertiserId = this.route.snapshot.params["id"] ? this.route.snapshot.params["id"] : undefined;	
		this.isEdit = this.advertiserId ? true : false;
		this.todayTime = this.publicService.getTodayStartandEnd().startDate;
		this.advertiser.validDate = this.advertiser.validDate ? this.advertiser.validDate : this.todayTime;
		this.formalValidDate = this.toFormalTime(this.advertiser.validDate);
		if(!this.isEdit){
			this.validDate = {
				singleDatePicker: true,
				showDropdowns: true,
				startDate: this.toFormalTime(this.advertiser.validDate),
				minDate: this.toFormalTime(this.todayTime),
				maxDate: "01/01/2040",
				locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
				autoUpdateInput: false
			};
		}
		
		this.advertiserAdx = this.clone(this.chineseService.config.ADVERTISER_ADX);
		let tokenType = window.localStorage.getItem("tokenType");
		let token = window.localStorage.getItem("token");
		let tokens = tokenType + " " + token;
		this.uploader = new FileUploader({
            url:this.baseUrl+"/advertiser/upload",
			autoUpload:true,
			allowedFileType:["image"],
			authToken: tokens
        });
		this.listenUpload();
		this.isEdit && this.editInit();
	}

	private getIndustries(){
		this.industryService.list().subscribe(
			result => {
				this.industries = result.body.items;
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}

	private editInit(){
		this.advertiserService.get(this.advertiserId).subscribe(
			result => {
				this.advertiser = result.body;
				this.formalValidDate = this.toFormalTime(this.advertiser.validDate);
				this.validDate = {
					singleDatePicker: true,
					showDropdowns: true,
					startDate: this.toFormalTime(this.advertiser.validDate),
					minDate: this.toFormalTime(this.todayTime),
					maxDate: "01/01/2040",
					locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
					autoUpdateInput: false
				};
				this.advertiser.adxIds = [];
				for(let i = 0;i < this.advertiser.audits.length;i++){
					this.advertiser.adxIds.push(this.advertiser.audits[i].adxId);
				}
				this.adxNames = this.getAdxidsnames(this.advertiser.adxIds);
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}

	//上传监听事件
    private listenUpload(): void{
        this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
            this.advertiser.qualificationPath = JSON.parse(response).path;
        };

        this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
            if(status == 401){
                this.router.navigate(["/login"]);
            }else if(response){
                this.myModalService.alert(JSON.parse(response).message);
            }
        }
        this.uploader.onWhenAddingFileFailed = (item:any, filter:any, options:any) => {
            this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL_PLEASE_NORMAL_FILE_FORMAT)
        }
    }
	// 展开显示adx选择框
	private toggleShowADX(){
		if(this.isShowADX){
			this.adxCancel();
		}else{
			this.isShowADX = true;
			this.adxInit();
		}	
	}
	// 时间选择
	private applyValiddate(e){
		this.advertiser.validDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.formalValidDate = this.toFormalTime(this.advertiser.validDate);
	}
	// 删除图片
	private removeQualificationPath(){
		let subject = this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.WHAT);
		subject.subscribe({
			next: (data) => {
				if(data){
					this.advertiser.qualificationPath = undefined;
				}
			}
		})
	}

	//将时间戳转换为日期
	private toFormalTime(time){
		if(!time){
			return;
		}
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
	// 选择adx取消
	private adxCancel(){
		this.adxRecover();
		this.isShowADX = false;
	}
	// 选择adx确定
	private adxConfirm(){
		this.adxChoice();
		this.adxRecover();
		this.isShowADX = false;
	}
	// adx选择确定
	private adxChoice(){
		this.advertiser.adxIds = [];
		this.adxNames = "";
		for(let i = 0;i < this.advertiserAdx.length;i++){
			if(this.advertiserAdx[i].value){
				this.adxNames += this.advertiserAdx[i].name + " ";
				this.advertiser.adxIds.push(this.advertiserAdx[i].id);
			}
		}
	}
	// 通过adxids获取名称
	private getAdxidsnames(ids){
		let names = "";
		for(let i = 0;i < this.advertiser.adxIds.length;i++){
			for(let j = 0;j < this.chineseService.config.ADVERTISER_ADX.length;j++){
				if(this.chineseService.config.ADVERTISER_ADX[j].id === this.advertiser.adxIds[i]){
					names += this.advertiserAdx[j].name + " ";
				}
			}
			
		}
        return names;
	}
	// 选择adx数据归零
	private adxRecover(){
		for(let i = 0;i < this.advertiserAdx.length;i++){
			this.advertiserAdx[i].value = false;
		}
	}
	// 选择adx数据初始化
	private adxInit(){
		for(let i = 0;i < this.advertiser.adxIds.length;i++){
			for(let j = 0;j < this.advertiserAdx.length;j++){
				if(this.advertiser.adxIds[i] === this.advertiserAdx[j].id){
					this.advertiserAdx[j].value = true;
					break;
				}
			}
		}
	}
	// 某一个adx是否存在
	private isExit(id,ids){
		let value = ids.indexOf(id) === -1 ? false : true;
		return value;
	}
	// 取消
	private cancel(){
		this.router.navigate(["/home/advertiser"]);
	}
	// 保存
	private confirm(){
		if(this.advertiser.adxIds.length === 0){
			this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_ADX);
			return;
		}
		if((this.isExit("8",this.advertiser.adxIds) || this.isExit("21",this.advertiser.adxIds)) && !this.advertiser.qualificationPath){
			this.myModalService.alert(this.chineseService.config.PLEASE_UPLOAD_QUALIFICATION);
			return;
		}
		if(this.validationService.validate()){
			if(this.isEdit){
				this.advertiserService.update(this.advertiserId,this.advertiser).subscribe(
					result => {
						this.router.navigate(["/home/advertiser"]);
					},
					error => {
						this.myModalService.alert(error.message);
					}
				)
			}else{
				this.advertiserService.create(this.advertiser).subscribe(
					result => {
						this.router.navigate(["/home/advertiser"]);
					},
					error => {
						this.myModalService.alert(error.message);
					}
				)
			}
		}else{
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}	
	}
	private clone(obj){
		return JSON.parse(JSON.stringify(obj));
	}
}
