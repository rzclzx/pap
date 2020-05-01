import { Component, OnInit, ViewChild, TemplateRef,ElementRef} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Page } from "../../models/page.model";
import { Project } from "../../models/project.model";
import { ProjectService } from "../../services/project.service";
import { MyModalService } from "../../services/myModal.service";
import { MaskService } from "../../services/mask.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";
declare var $;
@Component({
	selector: "project-list",
	templateUrl: "./dist/client/views/project/projectList.html",
})

export class ProjectListComponent implements OnInit{

	private projects: Project[] = [];
	private errorMessage;
	// 这个直接接受参数
	private selected = [];
	private allCheck:boolean;

	public options = {
		locale: this.chineseService.config.TIMERANGEPICKER_CONFIG,
		autoUpdateInput: false
	}
	
	@ViewChild("searchInput") searchInput: ElementRef;
	@ViewChild("totalbudget") totalbudget: ElementRef;
	@ViewChild("allchangeList") allchangeList;
    private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}
	private startDate: number;
	private endDate: number;
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private projectService: ProjectService,
		private myModalService: MyModalService,
		private maskService: MaskService,
		private chineseService: ChineseService,
		private publicService: PublicService
	) {

	}

	ngOnInit() {
		// 初始化加载表格数据
		this.timeInit();
		this.refreshTable();
	}
	private timeInit(){
		let obj = this.publicService.getTodayStartandEnd();
		this.startDate = obj.startDate;
		this.endDate = obj.endDate;
	}

	// 新建项目
	private gotoProjectAdd() {
		this.router.navigate(["/home/project/projectAdd"]);
	}

	private selectedDate(e) {
		this.startDate = e.startDate._d.getTime();
        this.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.refreshTable();
	}
	private editProject(id) {
		this.router.navigate(["/home/project/projectEdit", id]);
	}

	private changeStatus(id, status){
		this.projectService.status(id, {"status":status}).subscribe(
			result => {
				if (result.head.httpCode == 204) {
					this.refreshTable();
				}else{
					this.refreshTable();
					this.myModalService.alert(result.body.message)
				}

			},
			error => this.errorMessage = <any>error);
	}

	// 删除项目
	private deleteProject(projects) {
		if (projects.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		} else {
			let ids = [];
			let deleteStr='';
			for(let i=0;i<projects.length;i++){
				ids.push(projects[i].id);	
			}
			deleteStr = ids.join(",");
			let subject;
			if(ids.length == 1){
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.PROJECT + " " + projects[0].name + " " + this.chineseService.config.WHAT);
			}else{
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.PROJECT + this.chineseService.config.WHAT);
			}
			subject.subscribe({
				next: (data) => {
					if(data){
						this.projectService.delete(deleteStr)
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
	//project添加iswrite属性
	addIswrite(project){
		project.isWrite = false;
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


	// 刷新表格数据
	private refreshTable(obj?) {
		let options = {
			startDate: this.startDate,
			endDate: this.endDate,
			pageNo: this.page.pageNo + 1,
			pageSize: this.page.pageSize,
			name: this.searchInput.nativeElement.value
		}
		if(obj){
			for(let i in obj){
				options[i] = obj[i];
			}
		}
		this.projectService.list(options)
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let rows = [];
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[(options.pageNo - 1)*options.pageSize+i] = result.body.items[i];
							this.addIswrite(rows[(options.pageNo - 1)*options.pageSize+i]);
						}
						this.projects = rows;
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							if(!this.projects[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
								this.page.pageNo--;
							}
						}
					}else if(result.head.httpCode == 404){
						this.projects = [];
					}
				},
				error => this.errorMessage = <any>error);
		// 清除已选择数组
		this.selected = [];
		this.allCheck = false;
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

	//开关切换
	private switch(e,id){
		let value = e.target.checked;		
		if(value){
			this.changeStatus(id,"01");
		}else{
			this.changeStatus(id,"02");
     	}			
	}

	//更改价格
	switchWrite(project){
		if(!project.isWrite){
			project.isWrite = true;
		}

	}

	switchUnWrite(project,e){
		if(!/^[1-9]*[1-9][0-9]*$/.test(e.target.value)){
			this.myModalService.alert(this.chineseService.config.ALSO_INPUT_PLUS_INT);
			project.isWrite = false;
			return;
		}
		if(e.target.value.toString().length >8){
			this.myModalService.alert(this.chineseService.config.PRICE_ISNOT_EXTEND_EIGHT_NINE);
			project.isWrite = false;
			return;
		}else{
			let budget = parseInt(e.target.value);
			this.projectService.budget(project.id,budget)
				.subscribe(
				result => {
					if (result.head.httpCode == 204) {
						this.refreshTable();
					}else{
							this.myModalService.alert(result.body.message)
						}
					project.isWrite = false;
				},
				error => {
					project.isWrite = false;
					this.myModalService.alert(error.message)})
		}
		
	}
	private goMark(id): void{
		this.router.navigate(["/home/project/mark",id,"staticval"]);
	}

	private update(e): void{
		this.page.pageSize = e;
		this.refreshTable({pageNo: 1});
	}
	
	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.allchangeList,value,this.projects);
	}
	private outerDelete(e): void{
		this.deleteProject(this.selected);
	}
}