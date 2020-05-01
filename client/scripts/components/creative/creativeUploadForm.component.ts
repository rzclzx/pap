import { Component,OnInit,ViewChild,TemplateRef,OnDestroy,ElementRef,AfterViewInit,ViewChildren,QueryList} from "@angular/core";
import { Router,ActivatedRoute,NavigationEnd,Params } from "@angular/router";
import { Location } from "@angular/common";
import { FileUploader } from "ng2-file-upload"
import { Subject } from "rxjs/Subject";

import { AppTmplService } from "../../services/appTmpl.service";
import { CreativeService } from "../../services/creative.service";
import { CampaignService } from "../../services/campaign.service";
import { ProjectService } from "../../services/project.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";

import { ImageTmpl } from "../../models/tmpl.model";
import { Creative } from "../../models/creative.model";
import { Project } from "../../models/project.model";
import { Campaign } from "../../models/campaign.model";
import { CreativeImage,CreativeVideo,CreativeInfoFlow,CreativeGroup } from "../../models/creative.model";
import { ValidationService } from "../../services/validation.service";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "creative-upload-form",
	templateUrl: "./dist/client/views/creative/creativeUploadForm.html"
})

export class CreativeUploadFormComponent implements OnInit {

	baseFileUrl;

	baseUrl;

	id:string;

	type:string;

	campaignId:string;

	advertiserId: string;

	errorMessage:string;

	creative:CreativeGroup = {
		image:[],
		video:[],
		infoflow:[],
	};

	tmpls:Array<any> = [];

	columns ;

	uploadInfos;

	currentColumns:Array<any> = [];

	showArr:Array<any> = [];

	private imgSizes: any = [];

	materials: Array<any> = [];

	private imageArr: Array<any> = [];

	public adTypeInfo = [
		{ title:this.chineseService.config.IMAGE, name:"image", value: "01", isShow: false },
		{ title:this.chineseService.config.VIDEO, name:"video", value: "02", isShow: false },
		{ title:this.chineseService.config.INFOFLOW, name:"infoflow", value: "03", isShow: false }
	];

	private isEdit: boolean;

	private subject = new Subject();

	private saveSubject = new Subject();

	private editCreative;
	
	// 导入图片变量
	private currentRow = new CurrentRow();;

	private currentUploader;

	private currentFiletype;

	private project: Project;

	private campaign: Campaign;

	private projects: Array<Project> = [];

	private campaigns: Array<Campaign> = [];

	private campaignObj: Campaign;

	private projectId: string;

	@ViewChild("sizeTmpl") sizeTmpl: TemplateRef<any>;
	@ViewChild("imageFormatsTmpl") imageFormatsTmpl: TemplateRef<any>;
	@ViewChild("videoFormatsTmpl") videoFormatsTmpl: TemplateRef<any>;
	@ViewChild("mydatatable") mydatatable;
	@ViewChild("importModal") importModal: ModalComponent;
	@ViewChildren("list") list: QueryList<any>;

	constructor(
		private router:Router,
		private route:ActivatedRoute,
		private location: Location,
		private creativeSercive:CreativeService,
		private campaignSercive:CampaignService,
		private projectService: ProjectService,
		private appTmplService: AppTmplService,
		private validationService: ValidationService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	){
		this.route.params.subscribe((params:Params) => {
			this.setColumns();
			if(this.mydatatable)this.mydatatable.collapseAllRows();
			this.type = params["type"];
			this.id = params["id"] ? params["id"] : undefined;
			this.campaignId = params["campaignid"];	
			this.currentColumns = this.columns[this.type];
			for(let i=0;i<this.showArr.length;i++){
				this.showArr[i] = false;
			}
			this.isEdit = this.id ? true : false;
			if(!this.isEdit && this.campaignObj){
				this.getTmpls(this.campaignObj.target.adx);
			}
		});
		this.uploadInfos = {};
	}

	private urlInit(){
		this.baseFileUrl = eval(profiles + ".imgurlHref");
		this.baseUrl = eval(profiles + ".urlHref");
	}
	ngOnInit(){
		this.listProjectandCampaign();
		this.urlInit();
		this.setColumns();	
		this.currentColumns = this.columns[this.type];
		this.isEdit && this.editInit();
	}
	// 获取导入图片项目列表和活动列表
	private listProjectandCampaign(){
		this.campaignSercive.get(this.campaignId).subscribe(
			result => {
				if(result.head.httpCode === 200){
					this.campaignObj = result.body;
					if(!this.isEdit){
						this.addInit();
					    this.getTmpls(this.campaignObj.target.adx);
					}				
					this.projectId = this.campaignObj.projectId;
					this.projectService.get(this.projectId).subscribe(
						result => {
							if(result.head.httpCode === 200){
								this.advertiserId = result.body.advertiserId;
								this.projectService.list({ advertiserId: this.advertiserId }).subscribe(
									result => {
										if(result.head.httpCode === 200){
											this.projects = result.body.items;
										}
									}
								)
							}
						}
					)
				}
			}
		)
	}

	// 编辑
	private editInit(): void{
		this.creativeSercive.get(this.id).subscribe(
			result => {
				if(result.head.httpCode === 200){
					let row = result.body;
					this.editCreative = row;
					this.getTmpl(row);
				}else{
					this.myModalService.alert(result.body.message);
				}		
			},
			error => {
				this.myModalService.alert(error.message)
			}
		)
		this.subject.subscribe({
			next: (data) => {
				this.mydatatable.toggleExpandRow(this.tmpls[0]);
				this.showArr[0] = true;
			}
		})
	}
	// 通过模板id查模板
	private getTmpl(row): void{
		this.appTmplService["get" + this.type](row.tmplId).subscribe(
			result => {
				if(result.head.httpCode === 200){
					let tmpl = result.body;
					tmpl.adxName = row.adxName;
					this.tmpls.push(tmpl);
					if(this.type == "infoflow"){
						//信息流图片大小二维数组赋值
						this.imgSizes = this.getImgSizes(this.tmpls);
					}
					this.isEdit && this.subject.next();
					this.editCreativeInit(this.type,row);
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => error
		)
	}
	// 初始化编辑创意
	private editCreativeInit(type: string,row: any): void{
		this.uploadInfos[type] = [];
		let item;
		row.price = row.price.toString();
		switch(type){
			case "image":
				item = {
					creative:row,
					image:new uploadInfo({ tmplId:this.tmpls[0].id, allowedFileType:["image"],baseUrl: this.baseUrl ,isHasFile: true,path: row.imagePath,myModalService: this.myModalService,chineseService: this.chineseService})
				}
				break;
			case "video":
				item = {
					creative:row,
					video:new uploadInfo({ tmplId:this.tmpls[0].id,allowedFileType:["video"],baseUrl: this.baseUrl,isHasFile: true,path: row.videoPath,myModalService: this.myModalService,chineseService: this.chineseService}),
					image:new uploadInfo({ tmplId:this.tmpls[0].imageTmpl.id,allowedFileType:["image"],baseUrl: this.baseUrl,isHasFile: true,path: row.imagePath,myModalService: this.myModalService,chineseService: this.chineseService}),
				}
				break;
			case "infoflow":
			    if(this.tmpls[0].icon){
					item = {
						creative:row,
						icon:new uploadInfo({ tmplId:this.tmpls[0].icon.id,allowedFileType:["image"],baseUrl: this.baseUrl,isHasFile: true,path: row.iconPath,myModalService: this.myModalService,chineseService: this.chineseService}),
					};
				}else{
					item = {
						creative:row,
					};
				}
				
				for(let j=1;j<=10;j++)
					this.tmpls[0]["image"+j] && (item["image"+j] = new uploadInfo({ tmplId:this.tmpls[0]["image"+j].id,allowedFileType:["image"],baseUrl: this.baseUrl,isHasFile: true,path: row["image"+j+"Path"],myModalService: this.myModalService,chineseService: this.chineseService}));
				break;
		}
		this.uploadInfos[type].push(item);
	}
	// 新建
	private addInit(): void{		
		let adType = this.campaignObj.target.adType;
		if(adType){
			for(let i=0,len=this.adTypeInfo.length;i<len;i++){
				if(adType.indexOf(this.adTypeInfo[i].value) > -1){
					this.adTypeInfo[i].isShow = true;
				}
			}
		}	
	}

	setColumns(){
		let sizeTmpl = this.sizeTmpl,
			imageFormatsTmpl = this.imageFormatsTmpl,
			videoFormatsTmpl = this.videoFormatsTmpl;
		this.columns = {
			image:[
				{ name: this.chineseService.config.IMAGE_SIZE,prop: "width", cellTemplate: sizeTmpl, resizeable:false },
				{ prop: "adxName", name: "ADX", resizeable:false },
				{ prop: "maxVolume", name: this.chineseService.config.IMAGE_BIGORSMALL, resizeable:false },
				{ name: this.chineseService.config.IMAGE_TYPE, cellTemplate: imageFormatsTmpl, resizeable:false },
			],
			video:[
				{ name: this.chineseService.config.VIDEO_SIZE, cellTemplate: sizeTmpl, resizeable:false },
				{ prop: "adxName", name: "ADX", resizeable:false },
				{ name: this.chineseService.config.VIDEO_FORMAT, cellTemplate: videoFormatsTmpl, resizeable:false },
			],
			infoflow:[
				{ name: this.chineseService.config.IMAGE_SIZE, cellTemplate: sizeTmpl, resizeable:false },
				{ prop: "adxName", name: "ADX", resizeable:false }			
			]
		}
	}

	getTmpls(adxId:string){
		this.appTmplService[this.type](adxId)
			.subscribe(
				result => {
					if(result.head.httpCode == 200){
						this.tmpls = result.body.items;		
						for(let i=0;i<this.tmpls.length;i++){
							this.showArr[i] = false;
						}	
						if(this.type == "infoflow"){
							//信息流图片大小二维数组赋值
							this.imgSizes = this.getImgSizes(this.tmpls);
						}
						this.initUploadInfo(this.type);
					}else{
						this.tmpls = [];
					}
				},
				error => {
					this.myModalService.alert(error.message)
				}
			);
	}
	//信息流图片大小二维数组赋值方法
	private getImgSizes(tmpls): any{
		let arr = [];
		for(let i=0;i<tmpls.length;i++){
			let imgNum = 0;
			arr[i] = [];
			this.imageArr[i] = [];
			for(let j in tmpls[i]){
				if(j.indexOf("image") != -1){
					arr[i].push({
						width: tmpls[i][j].width,
						height: tmpls[i][j].height
					});
					let index = j.indexOf("image");
					index = index + 5;
					this.imageArr[i].push(j.charAt(index));
				}
			}
		}
		return arr;
	}

	initUploadInfo(type:string){
		this.uploadInfos[type] = [];
		for(let i=0,len=this.tmpls.length;i<len;i++){
			let item;
			switch(type){
				case "image":
					item = {
						creative:new CreativeImage(),
						image:new uploadInfo({ tmplId:this.tmpls[i].id, allowedFileType:["image"],baseUrl: this.baseUrl,myModalService: this.myModalService,chineseService: this.chineseService })
					}
					break;
				case "video":
					item = {
						creative:new CreativeVideo(),
						video:new uploadInfo({ tmplId:this.tmpls[i].id,allowedFileType:["video"],baseUrl: this.baseUrl,myModalService: this.myModalService,chineseService: this.chineseService}),
						image:new uploadInfo({ tmplId:this.tmpls[i].imageTmpl.id,allowedFileType:["image"],baseUrl: this.baseUrl,myModalService: this.myModalService,chineseService: this.chineseService}),
					}
					break;
				case "infoflow":
				    if(this.tmpls[i].icon){
						item = {
							creative:new CreativeInfoFlow(),
							icon:new uploadInfo({ tmplId:this.tmpls[i].icon.id,allowedFileType:["image"],baseUrl: this.baseUrl,myModalService: this.myModalService,chineseService: this.chineseService}),
						};
					}else{
						item = {
							creative:new CreativeInfoFlow(),
						};
					}			
					for(let j=1;j<=10;j++)
						this.tmpls[i]["image"+j] && (item["image"+j] = new uploadInfo({ tmplId:this.tmpls[i]["image"+j].id,allowedFileType:["image"],baseUrl: this.baseUrl,myModalService: this.myModalService,chineseService: this.chineseService}));
					break;
			}
			this.uploadInfos[type].push(item);
		}
	}

	onActivate($event){
        if($event.type == "click"){
			let index;
			for(let i=0;i<this.tmpls.length;i++){
				if($event.row == this.tmpls[i]){
					index = i;
				}
			}
			for(let i=0;i<this.showArr.length;i++){
				if(this.showArr[i] == true){
					this.mydatatable.toggleExpandRow(this.tmpls[i]);
					this.showArr[i] = false;
					if(index == i){
						return;
					}
				}
			}
			let that = this;
			setTimeout(() => {
				this.showArr[index] = true;
                this.mydatatable.toggleExpandRow($event.row);
			},1);
			
		}
    }

	save(index){
		if (this.validationService.validate()) {
			let item = this.uploadInfos[this.type][index];
			item.creative.tmplId = this.tmpls[index].id;
			item.creative.campaignId = this.campaignId;
			switch(this.type){
				case "image":
					item.creative.imageId = item.image.fileId ? item.image.fileId : (this.editCreative ? this.editCreative.imageId : undefined);
					break;
				case "video":
					item.creative.imageId = item.image.fileId ? item.image.fileId : (this.editCreative ? this.editCreative.imageId : undefined);
					item.creative.videoId = item.video.fileId ? item.video.fileId : (this.editCreative ? this.editCreative.videoId : undefined);
					break;
				case "infoflow":
				    if(item.icon){
						item.creative.iconId = item.icon.fileId ? item.icon.fileId : (this.editCreative ? this.editCreative.iconId : undefined);
					}	
					for(let i=1,len=10;i<=len;i++)
						item["image"+i] && (item.creative["image"+i+"Id"] = item["image"+i].fileId ? item["image"+i].fileId : (this.editCreative ? this.editCreative["image"+i+"Id"] : undefined));
					break;
			}
			
			if(this.type === "infoflow"){	
				if(item.creative.hasOwnProperty("iconId") && !item.creative.iconId){
					this.myModalService.alert(this.chineseService.config.EXIST_NOT_UPLOAD_IMAGE_PLEASE_UPLOAD);
					return;
				}
				for(let i=1,len=10;i<=len;i++)
					if(item.creative.hasOwnProperty("image"+i+"Id") && !item.creative["image"+i+"Id"]){
						this.myModalService.alert(this.chineseService.config.EXIST_NOT_UPLOAD_IMAGE_PLEASE_UPLOAD);
						return;
					}		
			}
			if(this.type === "image" || this.type === "video"){
				if(!item.creative.imageId){
					this.myModalService.alert(this.chineseService.config.PLEASE_UPLOAD_IMAGE)
					return;
				}
			}
			if(this.type === "video"){
				if(!item.creative.videoId){
					this.myModalService.alert(this.chineseService.config.PLEASE_UPLOAD_VIDEO)
					return;
				}
			}
			if(this.isEdit){
				this.creativeSercive.updateCreative(this.editCreative.id,this.type,item.creative).subscribe(
					result => {
						if(result.head.httpCode == 204){
							this.router.navigate(["/home/project/creativeUploadList",this.campaignId]);	
						}else{						
							this.myModalService.alert(this.chineseService.config.EDIT_FAIL);
						}
					},
					error => {
						this.myModalService.alert(error.message);
					}
				);
			}else{
				this.creativeSercive.createCreative(this.type,item.creative).subscribe(
					result => {
						if(result.head.httpCode == 201){
							this.myModalService.alert(this.chineseService.config.UPLOAD_SUCCESS);
							this.getTmpls(this.campaignObj.target.adx);								
						}else{
							this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL);
						}
					},
					error => {
						this.myModalService.alert(error.message);
					}
				);
			}
			
		}else{
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
		
	}
	

	//取消
	cancel(){
		this.router.navigate(["/home/project/creativeUploadList",this.campaignId]);
	}
	/**
	 * 导入图片部分
	 */

	// 打开导入图片modal
	private import(row,uploader,filetype): void{
		this.currentRow = row;
		this.currentUploader = uploader;
		let transform = {
			"image": "01",
			"video": "02"
		};
		this.currentFiletype = transform[filetype];
		this.listMaterial();
		this.importModal.open();
	}
	// 筛选功能
	private selectedProject(){
		if(this.project){
			this.campaign = undefined;
			this.campaignSercive.list({ projectId: this.project.id }).subscribe(
				result => {
					if(result.head.httpCode === 200){
						this.campaigns = result.body.items;
					}
				}
			)
			this.listMaterial({
				projectId: this.project.id
			});
		}else{
			this.campaign = undefined;
			this.campaigns = [];
			this.listMaterial();
		}
		
	}
	private selectedCampaign(){
		if(this.campaign){
			this.listMaterial({
				projectId: this.project.id,
				campaignId: this.campaign.id
			});
		}else{
			this.listMaterial({
				projectId: this.project.id
			});
		}
	}
	// 列出导入素材
	private listMaterial(obj?){	
		let options = {
			advertiserId: this.advertiserId,
			width: this.currentRow.width,
			height: this.currentRow.height,
			formats: this.currentRow.formats,
			type: this.currentFiletype
		};
		if(obj){
			for(let i in obj){
				options[i] = obj[i];
			}
		}
		this.creativeSercive.listMaterial(options).subscribe(
			result => {
				if(result.head.httpCode === 200){
					this.materials = result.body;
					for(let i = 0;i < this.materials.length;i++){
						this.materials[i].ischoice = false;
					}
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message);
			}
		)
	}
	// 选择图片
	private importChoose(index): void{
		for(let i=0;i<this.materials.length;i++){
			this.materials[i].ischoice = false;
		}
		this.materials[index].ischoice = true;
	}
	// 取消按钮
	private importCancel(): void{
		this.importModal.close();
	}
	// 确定提交
	private importConfirm(): void{
		for(let i = 0;i < this.materials.length;i++){
			if(this.materials[i].ischoice){
				this.currentUploader.fileId = this.materials[i].id;
				this.currentUploader.path = this.materials[i].path;
				this.currentUploader.isHasFile = true;
				break;
			}
		}
		this.importModal.close();
	}
	// 跳转活动列表
	gotoCampaignList(){	
		this.router.navigate(["/home/project/campaign/list",this.projectId]);			
	}
}











class uploadInfo {

	isHasFile: boolean = false;

	path: string="";

	uploader:FileUploader;

	fileId:string;

	baseUrl: string;

	myModalService: MyModalService;

	chineseService: ChineseService

	deleteFile() {
		this.path = "";
		this.isHasFile = false;
		delete this.fileId;
	}

	onSuccessItem(item: any, response: any, status: any, headers: any){
		this.fileId = JSON.parse(response).body.id;
	};

	onBuildItemForm(fileItem: any, form: any){
		form.append("tmplId",this.config.tmplId);
	};

	private getToken(){
		let tokenType = window.localStorage.getItem("tokenType");
		let token = window.localStorage.getItem("token");
		let tokens = tokenType + " " + token;
		return tokens;
	}

	constructor(private config) {
		this.baseUrl = config.baseUrl;
		this.isHasFile = config.isHasFile ? config.isHasFile : false;
		this.path = config.path ? config.path : "";
		this.myModalService = config.myModalService;
		this.chineseService = config.chineseService;
		this.uploader = new FileUploader({
			url:this.baseUrl+"/creative/upload",
			autoUpload:true,
			allowedFileType:config.allowedFileType,
			authToken: this.getToken()
		})

		this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
			this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL);
		} 

		this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
			this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL_PLEASE_NORMAL_FILE_FORMAT);
		} 
		
		this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
			if(status === 200){
				this.fileId = JSON.parse(response).id;
				this.path = JSON.parse(response).path;
				this.isHasFile = true;
			}else{
				this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL);
			}

		}

		this.uploader.onBuildItemForm = (fileItem: any, form: any) => this.onBuildItemForm(fileItem, form);
	}
}

class CurrentRow{
	width: any;
	height: any;
	formats: any;
}