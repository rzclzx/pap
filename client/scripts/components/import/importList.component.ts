import { Component,OnInit,ViewChild,TemplateRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Page } from "../../models/page.model";
import { Import } from "../../models/import.model";
import { DataService } from "../../services/data.service";
import { ChineseService } from "../../services/chinese.service";


@Component({
	selector: "import-list",
	templateUrl: "./dist/client/views/import/importList.html"
})

export class ImportListComponent implements OnInit {

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}
	private imports: Array<Import> = [];

	private selected = [];
	private allCheck:boolean;

	private sortNameType: string;

	private sortTimeType: string;

	private sortKey: string;

	private sortType: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private dataService: DataService,
		private chineseService: ChineseService
	) {}

	ngOnInit() {
		this.refreshTable();
	}

	private gotoImportForm() {
		this.router.navigate(["./home/import/importForm"]);
	}
	private refreshTable(obj?: any) {
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
		this.dataService.importList(options)
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let rows = [];
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
						}
						this.imports = rows;
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							if(!this.imports[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
								this.page.pageNo--;
							}
						}
					}else if(result.head.httpCode == 404){
						this.imports = [];
					}
				},
				error => error);
		// 清除已选择数组
		this.selected = [];
		this.allCheck = false;
	}

	private onPage(event){
		this.page.pageNo = event.offset;
		this.refreshTable();
	}

    private update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo: 1});
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
        if(this.imports.length !== 0){
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
		this.sortKey = "create_time";
		this.sortType = this.sortTimeType;
        if(this.imports.length !== 0){
            this.refreshTable();
        } 
	}
}