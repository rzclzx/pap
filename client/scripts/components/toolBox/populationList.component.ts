import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Page } from "../../models/page.model";
import { PopulationService } from "../../services/population.service";
import { MyModalService } from "../../services/myModal.service";
import { MaskService } from "../../services/mask.service";
import { ChineseService } from "../../services/chinese.service";

import { Population } from "../../models/population.model";

@Component({
	selector: "population-list",
	templateUrl: "./dist/client/views/toolBox/populationList.html",
})

export class populationListComponent implements OnInit {

	private errorMessage;

	private populations: Population[] = [];

	@ViewChild("datatable") datatable;

	private selected = [];
	private allCheck:boolean;

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

	private sortNameType: string;

	private sortTimeType: string;

	private sortKey: string;

	private sortType: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private populationService: PopulationService,
		private myModalService: MyModalService,
		private maskService: MaskService,
		private chineseService: ChineseService
	) {}

	ngOnInit() {
		this.refreshTable();
	}

	private refreshTable(obj?:any) {
		let options = {
			pageNo: this.page.pageNo + 1,
			pageSize: this.page.pageSize,
			sortKey: this.sortKey,
			sortType: this.sortType
		}
		if(obj){
			for(let i in obj){
				options[i] = obj[i];
			}
		}
		this.populationService.list(options)
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let rows = [];
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
						}
						this.populations = rows;
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							if(!this.populations[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
								this.page.pageNo--;
							}
						}
					}else if(result.head.httpCode == 404){
						this.populations = [];
					}
				},
				error => this.errorMessage = <any>error);
		// 清除已选择数组
		this.selected = [];
		this.allCheck = false;
	}
	private edit(id): void{
		this.router.navigate(["/home/population/populationForm",id]);
	}
	private gotoUpload(): void{
		this.router.navigate(["/home/population/populationForm"]);
	}
	onPage(event){
		this.refreshTable({pageNo: event.offset + 1,pageSize: this.page.pageSize});
	}

	onSelect(event,page){
		if(!event.selected)
			return;
		this.allCheck = event.selected.length == ((page.pageNo+1)*page.pageSize > page.total ? page.total % page.pageSize : page.pageSize) ? true : false;
	}
	/**
	 * 页码功能
	 */
	private update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo: 1,pageSize: this.page.pageSize});
	}
	
	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.datatable,value,this.populations);
	}

	
	private outerDelete(e): void{
		this.delete(this.selected);
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
	// 删除项目
	private delete(selected) {
		if (selected.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		} else {
			let ids = [];
			let deleteStr='';
			for(let i=0;i<selected.length;i++){
				ids.push(selected[i].id);	
			}
			deleteStr = ids.join(",");
			let subject;
			if(ids.length == 1){
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.POPULATION + " " + selected[0].name + " " + this.chineseService.config.WHAT);
			}else{
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.POPULATION + this.chineseService.config.WHAT);
			}
			subject.subscribe({
				next: (data) => {
					if(data){
						this.populationService.delete(deleteStr)
						.subscribe(
							result => {
								if (result.head.httpCode == 204) {
									this.myModalService.alert(this.chineseService.config.SUCCESS);
									this.refreshTable();
								} else {
									this.myModalService.alert(result.body.message);
								}

							},
							error => {
							this.myModalService.alert(error.message);
						});
					}
					
				}
			})

		}
	}

	private sortName(){
		this.sortTimeType = undefined;
		if(!this.sortNameType){
			this.sortNameType = "01";
		}else if(this.sortNameType === "01"){
			this.sortNameType = "02";
		}else{
			this.sortNameType = "01";
		}
		this.sortKey = "name";
		this.sortType = this.sortNameType;
        if(this.populations.length !== 0){
            this.refreshTable();
        } 
	}

	private sortTime(){
		this.sortNameType = undefined;
		if(!this.sortTimeType){
			this.sortTimeType = "01";
		}else if(this.sortTimeType === "01"){
			this.sortTimeType = "02";
		}else{
			this.sortTimeType = "01";
		}
		this.sortKey = "update_time";
		this.sortType = this.sortTimeType;
        if(this.populations.length !== 0){
            this.refreshTable();
        } 
	}
}