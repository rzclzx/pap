import { Component,OnInit,ViewChild,TemplateRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Advertiser } from "../../models/advertiser.model";
import { Audit } from "../../models/advertiser.model";
import { Page } from "../../models/page.model";

import { AdvertiserService } from "../../services/advertiser.service";
import { CodeService } from "../../services/code.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "advertiser-list",
	templateUrl: "./dist/client/views/advertiser/advertiserAdx.html"
})

export class AdvertiserAdxComponent implements OnInit {

	@ViewChild("datatable") datatable;

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

	private errorMessage;
	private advertiser: Advertiser;

	private allCheck: boolean;

	private advertiserId: string;

	private audits: Array<Audit>;

	private selected = [];

	private statusObj: Object;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private advertiserService: AdvertiserService,
		private codeService: CodeService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {}

	ngOnInit() {
		this.advertiserId = this.route.snapshot.params["id"];
		this.dataInit();
		this.refreshTable();
	}
	private dataInit(): void{
		this.statusObj = this.codeService.advertiserStatus;
	}
	//设置客户
	private refreshTable(): void{
		this.advertiserService.get(this.advertiserId).subscribe(
			result => {
				if(result.head.httpCode === 200){
					this.advertiser = result.body;
					this.audits = this.advertiser.audits;				
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)		
	}

	// 同步客户
	private sync(id): void{
		this.advertiserService.synchronize(id).subscribe(
			result => {
				if(result.head.httpCode === 204){
					this.myModalService.alert(this.chineseService.config.SYNC_SUCCESS);	
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
	// 审核客户
	private audit(id): void{
		this.advertiserService.audit(id).subscribe(
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
	//开关切换
	private switch(e,row): void{
		let value = e.target.checked;
		if(value){
			this.changeStatus(row.id,"01");
		}else{
			this.changeStatus(row.id,"02");
		}	
	}
	// 改变状态
	private changeStatus(adxId,status): void{
		this.advertiserService.adx(adxId,{enable: status}).subscribe(
			result => {
				if(result.head.httpCode === 204){
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