import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { Landpage } from "../../models/landpage.model";
import { Page } from "../../models/page.model";
import { LandpageService } from "../../services/landpage.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "landpage-list",
	templateUrl: "./dist/client/views/landpage/landpageList.html",
})

export class LandpageListComponent implements OnInit {

	private landpages: Landpage[] = [];
	private errorMessage;
	// 这个直接接受参数
	private selected = [];

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}

	private statusObj = {
		"02": this.chineseService.config.CODE_INSTALL_SUCCESS,
		"03": this.chineseService.config.CODE_INSTALL_FAIL
	}

	@ViewChild("codeModal")
	codeModal: ModalComponent;

	private allCheck;

	private viewCode;

	private checkCodes: Array<string> = [];

	private sortNameType: string;

	private sortKey: string;

	private sortType: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private landpageService: LandpageService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {}

	@ViewChild("datatable") datatable;

	ngOnInit() {
		// 初始化加载表格数据
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

	// 刷新表格数据
	private refreshTable(obj?) {
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
		this.landpageService.list(options).subscribe(
			result => {
				if (result.head.httpCode == 200) {
					let rows = [];
					for (let i = 0,len = result.body.items.length; i < len; i++) {
						rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
					}
					this.landpages = rows;
					this.selected = [];
					this.allCheck = false;
					if(result.body.pager){
						this.page = result.body.pager;
						this.page.pageNo--;
						if(!this.landpages[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
							this.page.pageNo--;
						}
					}
				}
			},
			error => this.errorMessage = <any>error);
		// 清除已选择数组
		this.selected = [];
	}

	// 删除落地页
	private deleteProject(selected) {
		if (selected.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		} else {
			let idsArr:Array<string> = [];
			for(let i=0,len=this.selected.length;i<len;i++){
				idsArr.push(this.selected[i].id);
			}			
			let subject;
			if(idsArr.length == 1){
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.LANDPAGE + " " + selected[0].name + " " + this.chineseService.config.WHAT);
			}else{
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.LANDPAGE + this.chineseService.config.LANDPAGE);
			}
			subject.subscribe({
				next: (data) => {
					if(data){
						this.landpageService.delete(idsArr.join(","))
						.subscribe(
							result => {
								if (result.head.httpCode == 204) {
									this.myModalService.alert(this.chineseService.config.SUCCESS);
								} else if(result.head.httpCode == 400){
									this.myModalService.alert(result.body.message);
								}
								this.refreshTable();
							},
							error => {
							this.myModalService.alert(error.message);
						});
					}
					
				}
			})
			
		}
	}

	// 新建落地页
	private gotoProjectAdd() {
		this.router.navigate(["home/landpage/landpageForm"]);
	}

	// 查看代码
	private getCode(row) {
		this.checkCodes = row.codes ? row.codes : [];
		if(row.codes && row.codes.length !== 0){
			for(let i=0;i<row.codes.length;i++){
				this.checkCodes[i] = row.codes[i];
			}
		}
		let landpage_id = row.id;
		let url = "//192.168.3.93/pap/pxene.js";
		let code = `<script>var _pxe=_pxe||[];var _pxe_id='${landpage_id}';(function(){var pxejs=document.createElement('script');var _pxejsProtocol=(('https:'==document.location.protocol)?'https://':'http://');pxejs.src=_pxejsProtocol+'${url}';var one=document.getElementsByTagName('script')[0];one.parentNode.insertBefore(pxejs,one);})();</script>`
		this.codeModal.open()
			.then(()=>{
				this.viewCode = code;
			});
	}

	// 检查落地页
	private checkLandpage(row) {
		this.landpageService.check(row.id)
			.subscribe(
					result => {
						if (result.head.httpCode == 200) {
							row.status = result.body.status;
							this.refreshTable();
							this.myModalService.alert(this.statusObj[row.status]);
						} else {
							this.myModalService.alert(result.body.message);
						}
						this.refreshTable();
					},
					error => this.errorMessage = <any>error);
	}
	// 编辑落地页
	private gotoLandpageForm(id): void{
		this.router.navigate(["/home/landpage/landpageForm",id]);
	}
	// 页脚部分
	private update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo: 1});
	}
	
	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.datatable,value,this.landpages);
	}
	private outerDelete(e): void{
		this.deleteProject(this.selected);
	}

	private sortName(){
		if(!this.sortNameType){
			this.sortNameType = "01";
		}else if(this.sortNameType === "01"){
			this.sortNameType = "02";
		}else{
			this.sortNameType = "01";
		}
		this.sortKey = "name";
		this.sortType = this.sortNameType;
        if(this.landpages.length !== 0){
            this.refreshTable();
        } 
	}
}