import { Component,OnInit,ViewChild,TemplateRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Advertiser } from "../../models/advertiser.model";
import { Page } from "../../models/page.model";

import { AdvertiserService } from "../../services/advertiser.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "advertiser-list",
	templateUrl: "./dist/client/views/advertiser/advertiserList.html"
})

export class AdvertiserListComponent implements OnInit {

	private errorMessage;

	private advertisers: Advertiser[] = [];

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

	private allCheck: boolean;

	@ViewChild("datatable") datatable;

	private selected = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private advertiserService: AdvertiserService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {
		
	}

	ngOnInit() {
		this.refreshTable();
	}

	onPage(event){
		this.page.pageNo = event.offset;
		this.refreshTable();
	}

	onSelect(event,page){
		if(!event.selected)
			return;
		this.allCheck = event.selected.length == ((page.pageNo+1)*page.pageSize > page.total ? page.total % page.pageSize : page.pageSize) ? true : false;
	}

	private gotoAdvertiserForm(id) {
		this.router.navigate(id ? ["./advertiserForm", id] : ["./advertiserForm"], { relativeTo: this.route });
	}

	private gotoAdvertiserAdx(id) {
		this.router.navigate(["/home/advertiser/advertiserAdx",id]);
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

	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.datatable,value,this.advertisers);
	}

	private outerDelete(e): void{
		this.delSelectedAdvertiser(this.selected);
	}

	delSelectedAdvertiser(selected){
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
			subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.ADVERTISER + " " + selected[0].name + " " + this.chineseService.config.WHAT);
		}else{
			subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.ADVERTISER + this.chineseService.config.WHAT);
		}
		subject.subscribe({
			next: (data) => {
				if(data){
					this.advertiserService.delete(ids.join(","))
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

	private refreshTable(obj?) {
		let options = {
			pageNo: this.page.pageNo + 1,
			pageSize: this.page.pageSize
		}
		if(obj){
			for(let i in obj){
				options[i] = obj[i];
			}
		}
		this.advertiserService.list(options)
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let rows = [];
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
						}
						this.advertisers = rows;
						this.selected = [];
						this.allCheck = false;
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							if(!this.advertisers[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
								this.page.pageNo--;
							}
						}
					}
				},
				// 待续 错误归纳打印
				error => error);
	}

	update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo: 1});
	}
}