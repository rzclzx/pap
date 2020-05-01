import { Component,OnInit,ViewChild,TemplateRef,ElementRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { FileUploader } from "ng2-file-upload"

import { Project } from "../../models/project.model";

import { ProjectService } from "../../services/project.service"
import { BaseService } from "../../services/base.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import "../../../resource/request.js";
declare var profiles;

@Component({
	selector: "import-form",
	templateUrl: "./dist/client/views/import/importForm.html"
})

export class ImportFormComponent implements OnInit {

    @ViewChild("file") file: ElementRef;

    private uploader: any;

    private baseUrl: string;

    private upload: FileUploader;

    private path: string;

    private isHasImage: boolean = false;

    private uploadMessage: string = this.chineseService.config.PLEASE_UPLOAD_FILE;

    private downloadUrl: string;

    private fileName: string;

    private project: Project;

    private projects: Array<Project> = [];

    private choseProject: boolean = false;

    constructor(
        private router: Router,
        private projectService: ProjectService,
        private myModalService: MyModalService,
        private chineseService: ChineseService
    ){}

    ngOnInit(){
        this.dataInit();
    }
    //数据初始化
    private dataInit(): void{

        // 获取路径
        this.baseUrl = eval(profiles + ".urlHref") +"/data/effect/import";
        // 获取项目列表
        this.projectService.list().subscribe(
            result => {
                if(result.head.httpCode === 200){
                    let projects = result.body.items || [];
                    for(let i=0;i<projects.length;i++){
                        this.projects[i] = projects[i];
                    }
                }else{
                    this.myModalService.alert(result.body.message);
                }
            },
            error => error
        )
        // 初始化上传对象
        let tokenType = window.localStorage.getItem("tokenType");
		let token = window.localStorage.getItem("token");
		let tokens = tokenType + " " + token;
        this.uploader = new FileUploader({
            url:this.baseUrl,
            allowedFileType:["xls"],
            authToken: tokens
        });
        this.listenUpload();
    }
    //上传监听事件
    private listenUpload(): void{
        this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
            this.router.navigate(["/home/import"]);
        };

        this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
            if(status == 401){
                this.router.navigate(["/login"]);
            }
            this.myModalService.alert(JSON.parse(response).message);
        }
        this.uploader.onAfterAddingFile = (fileItem: any) => {
            let fileStr = this.file.nativeElement.value;
            this.uploadMessage = this.cutFileName(fileStr);
        }
        this.uploader.onWhenAddingFileFailed = (item:any, filter:any, options:any) => {
            this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL_PLEASE_NORMAL_FILE_FORMAT)
        }
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append("projectId",this.project.id);
        }
    }
    // 截取文件名
    private cutFileName(str){
        let arr = str.split("\\");
        let fileName = arr[arr.length-1];
        return fileName;
    }
    // 选择项目
    private selected(): void{
        if(!this.project){
            this.choseProject = false;
            return;
        }
        this.choseProject = true;
        this.downloadUrl = eval(profiles + ".urlHref") + "/file/effect/download/" + this.project.id + ".xlsx";
        this.fileName = this.project.id + ".xlsx";
    }

    // 选择项目提示
    private projectAlert(){
        this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_PROJECT);
    }

    // 保存
    private save(): void{
        if(!this.project){
            this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_PROJECT);
            return;
        }
        if(!this.uploader.queue[0]){
            this.myModalService.alert(this.chineseService.config.PLEASE_UPLOAD_FILE);
            return;
        }
        this.uploader.queue[this.uploader.queue.length-1].upload();
    }
    
}