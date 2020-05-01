import { Component,OnInit,ViewChild,TemplateRef,ElementRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Campaign } from "../../models/campaign.model"
import { Page } from "../../models/page.model";
import { CampaignService } from "../../services/campaign.service"
import { ProjectService } from "../../services/project.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { PublicService } from "../../services/public.service";
import { Project } from "../../models/project.model";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
	selector: "campaign-list",
	templateUrl: "./dist/client/views/campaign/campaignList.html"
})

export class CampaignListComponent implements OnInit {

	private projectId: string;

	public daterange: any = {};

	public errorMessage;

	private page:Page = {
		pageNo: 0,
		pageSize: 10,
		total: 0
	}
	allCheck:boolean;

	private startDate: number;
	private endDate: number;
	public campaigns:Campaign[] = [];
    public project:Project;
	public selected = [];
	initvalue: string;

	private locale: Object = this.chineseService.config.TIMERANGEPICKER_CONFIG;

	public options = {
		locale: this.locale,
		autoUpdateInput: false
	}
	@ViewChild("searchInput") searchInput: ElementRef;
	@ViewChild("editTmpl") editTmpl: TemplateRef<any>;
	@ViewChild("totalbudget") totalbudget: ElementRef;
	@ViewChild("copyModal") copyModal: ModalComponent;
	@ViewChild("allchangeList") allchangeList;
	//复制功能变量
	private projects:Array<Project>;

	private copyCampaign: Campaign = new Campaign();

	private copyProject: Project;

	// 每个活动的时间
	private campaignsTime: Array<string> = [];

	private campaingsTimeOptions: Array<Object> = [];

	private sortNameType: string;

	private sortKey: string;

	private sortType: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private campaignService: CampaignService,
		private projectService: ProjectService,
		private myModalService: MyModalService,
		private chineseService: ChineseService,
		private publicService: PublicService
	) {}

	ngOnInit() {		
		this.dataInit();
		this.listCampaigns();	
	}
	// 数据初始化
	private dataInit(): void{
		this.timeInit();
		this.initvalue = this.toFormalTime(this.startDate)+" - "+this.toFormalTime(this.endDate);
		this.projectId = this.route.snapshot.params["projectId"];
	}
	private timeInit(){
		let obj = this.publicService.getTodayStartandEnd();
		this.startDate = this.route.snapshot.params["startDate"] ? parseInt(this.route.snapshot.params["startDate"]) : obj.startDate;
		this.endDate = this.route.snapshot.params["endDate"] ? parseInt(this.route.snapshot.params["endDate"]) : obj.endDate;
	}
	// 选择活动
	onSelect(event,page){
		if(!event.selected)
			return;
		this.allCheck = event.selected.length == ((page.pageNo+1)*page.pageSize > page.total ? page.total % page.pageSize : page.pageSize) ? true : false;
	}
	//选择时间
	private selectedDate(e) {
		this.startDate = e.startDate._d.getTime();
        this.endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.initvalue = this.toFormalTime(this.startDate)+" - "+this.toFormalTime(this.endDate);
		this.listCampaigns();
	}
	//删除项目
	private deleteCampaign(campaigns) {
		if (campaigns.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		} else {
			let ids = [];
			let deleteStr='';
			for(let i=0;i<campaigns.length;i++){
				ids.push(campaigns[i].id);	
			}
			deleteStr = ids.join(",");
			let subject;
			if(ids.length == 1){
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.chineseService.config.CAMPAIGN + ' ' +campaigns[0].name + ' ' + this.chineseService.config.WHAT);
			}else{
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.chineseService.config.CAMPAIGN + this.chineseService.config.WHAT);
			}
			subject.subscribe({
				next: (data) => {
					if(data){
						this.campaignService.delete(deleteStr)
							.subscribe(
								result => {
									if (result.head.httpCode == 204) {
										this.myModalService.alert(this.chineseService.config.SUCCESS);
										this.listCampaigns();
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
	addIswrite(campaign){
		campaign.isWrite = false;
	}
	// 刷新页面
	listCampaigns(options?) {
		let obj = {
			projectId:this.projectId,
			startDate: this.startDate,
			endDate: this.endDate,
			pageNo: this.page.pageNo + 1,
			pageSize: this.page.pageSize,
			calScore: true,
			name: this.searchInput.nativeElement.value,
			sortKey: this.sortKey,
			sortType: this.sortType
		}
		if(options){
			for(let i in options){
				obj[i] = options[i];
			}
		}
		let deleteNum = this.selected.length;
		let asyncNum = 0;
		//获取项目的状态信息
		this.projectService.get(obj.projectId)
			.subscribe(			
				result => {
						if (result.head.httpCode == 200) {														
							this.project = result.body;
							this.getProjects();
							asyncNum++;	
							//判断活动状态
							if(asyncNum == 2){
								let start = (obj.pageNo-1)*obj.pageSize,
				                    end = obj.pageNo*obj.pageSize > this.page.total ? this.page.total : obj.pageNo*obj.pageSize;
								for(let i=start; i<end; i++){							
									this.judgeStatus(this.campaigns[i],this.project.status);
								}	
							}													
					}
				},
				error => {
					this.errorMessage = <any>error
				});
		//获取活动列表数据
		this.campaignService.list(obj)
			.subscribe(
				result => {
					if (result.head.httpCode == 200){
						//页码赋值
						if(result.body.pager){
							this.page = result.body.pager;
							this.page.pageNo--;
							this.page.total = result.body.pager.total;
						}					
						//获取活动列表
						let start = (obj.pageNo-1)*obj.pageSize;
						let end = obj.pageNo*obj.pageSize > this.page.total ? this.page.total : obj.pageNo*obj.pageSize;
						let rows = [];
						asyncNum++;	
						for (let i = 0,len = result.body.items.length; i < len; i++) {
							rows[start+i] = result.body.items[i];
							this.addIswrite(rows[start+i]);
							rows[start+i].statusMessage = null;					
						}
						
						this.campaigns = rows;
						if(!this.campaigns[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
							this.page.pageNo--;
						}
						// 活动时间转化
						for(let i=start;i<end;i++){
							this.campaignsTime[i] = this.toFormalTime(this.campaigns[i].startDate) + "-" + this.toFormalTime(this.campaigns[i].endDate);
						}
						// 时间插件对象赋值
						for(let i=start;i<end;i++){
							this.campaingsTimeOptions[i] = {
								locale: this.locale,
								autoUpdateInput: false,
								//minDate: this.toFormalTime(new Date().getTime()),
								startDate: this.toFormalTime(this.campaigns[i].startDate),
								endDate: this.toFormalTime(this.campaigns[i].endDate)
							}
						}						
						//判断活动状态
						if(asyncNum == 2){
							let start = (obj.pageNo-1)*obj.pageSize,
								end = obj.pageNo*obj.pageSize > this.page.total ? this.page.total : obj.pageNo*obj.pageSize;
							for(let i=start; i<end; i++){							
								this.judgeStatus(this.campaigns[i],this.project.status);
							}	
						}	
						this.selected = [];
						this.allCheck = false;			
					}else if(result.head.httpCode == 404){
						this.campaigns = [];
					}
				},
				error => {
					this.myModalService.alert(error.message);
				}
			);
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
	// 新建活动
	addCampaign() {
		this.router.navigate(["/home/project/campaign/add", this.projectId]);
	}
	// 点击页码
	onPage(event){
		this.page.pageNo = event.offset;
		this.listCampaigns();
	}
    // 编辑活动
	editCampaign(id){
		this.router.navigate(["/home/project/campaign/edit", id]);
	}
	// 改变状态
	private changeStatus(id,status){
		this.campaignService.status(id,{"status":status}).subscribe(
			result => {
				if (result.head.httpCode == 204){
					this.listCampaigns();
				}else{				
					this.listCampaigns();
					this.myModalService.alert(result.body.message)
				}
					
			},
			error => {
				this.myModalService.alert(error.message);
			});
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


	//判断状态函数
	judgeStatus(row,status){
		let nowDate = new Date().getTime();
		if(nowDate < row.startDate){
			row.statusMessage = this.chineseService.config.NOT_ACTION;
		}else if(nowDate > row.endDate){
			row.statusMessage = this.chineseService.config.FINISH;
		}else if(row.status == '01' && status == '01'){
			if(row.reason){
				row.statusMessage = this.chineseService.config.REASON_OBJ[row.reason];
			}else{
				row.statusMessage = this.chineseService.config.ACTION;
			}	
		}else{
			row.statusMessage = this.chineseService.config.PAUSE;
		}
		
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

	/**
	 * 与页脚组件通讯
	 * 
	 */
	private update(e): void{
		this.page.pageSize = e;
		this.listCampaigns({pageNo: 1});
	}
	
	private allToggleOuter(value){
		this.allCheck = value;
		this.allToggle(this.allchangeList,value,this.campaigns);
	}
	private outerDelete(e): void{
		this.deleteCampaign(this.selected);
	}
	private outerSync(e): void{
		this.syncCampaign(this.selected);
	}
	private syncCampaign(arr): void{
		if(arr.length === 0){
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		}else{
			let ids = [];
			for(let i=0;i<arr.length;i++){
				ids.push(arr[i].id);
			}
			let str = ids.join(",");
			this.campaignService.synchronizes(str).subscribe(
				result => {
					if(result.head.httpCode == 204){
						this.myModalService.alert(this.chineseService.config.SYNC_SUCCESS)
						this.listCampaigns();
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
	//复制功能
	private copy(row): void{
		this.copyCampaign = row;
		this.copyModal.open();
	}
	private copyCancel(){
		this.copyModal.close();
	}
	private copyConfirm(): void{
		if(this.copyProject){
			let rowString = JSON.stringify(this.copyCampaign);
			window.sessionStorage.setItem("campaign", rowString);
			this.router.navigate(["/home/project/campaign/add", this.copyProject.id,true]);
		}else{
			this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_COPY_PROJECT);
		}
		

	}
	//出价
	private changePrice(event): void{
		let selected = event.selected;
		let price = event.price;
		let ids = [];
		let str='';
		for(let i=0;i<selected.length;i++){
			ids.push(selected[i].id);	
		}
		str = ids.join(",");

		this.campaignService.price(str, {price: price})
		.subscribe(
			result => {
				if (result.head.httpCode == 204) {
					this.myModalService.alert(this.chineseService.config.SUCCESS);
					this.listCampaigns();
				} else {
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message)
			});
	}
	// 选择每个活动的时间
	private selectedOneDate(e,row): void{
		let startDate = e.startDate._d.getTime();
		let endDate = e.endDate._d.getTime() - e.endDate._d.getTime()%1000;
		this.campaignService.date(row.id,{
			startDate: startDate,
			endDate: endDate
		}).subscribe(
			result => {
				if(result.head.httpCode === 204){
					this.myModalService.alert(this.chineseService.config.TIME_UPDATE_SUCCESS);
					this.listCampaigns();
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}
	// 获取项目列表
	private getProjects(): void{
		if(this.projects){
			return;
		}
		this.projectService.list({advertiserId:this.project.advertiserId}).subscribe(
			result => {
					if(result.head.httpCode == 200){
						this.projects = result.body.items || [];
					}
				},
				error => this.errorMessage = <any>error
		)
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
        if(this.campaigns.length !== 0){
            this.listCampaigns();
        } 
	}
}