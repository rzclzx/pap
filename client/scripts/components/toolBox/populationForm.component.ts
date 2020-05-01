import { Component,OnInit,ViewChild,TemplateRef,ElementRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { FileUploader } from "ng2-file-upload"

import { Population } from "../../models/population.model";

import { PopulationService } from "../../services/population.service"
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { RootService } from "../../services/root.service";
import "../../../resource/request.js";
declare var profiles;

import { ValidationService } from "../../services/validation.service";

@Component({
	selector: "import-form",
	templateUrl: "./dist/client/views/toolBox/populationForm.html"
})

export class PopulationFormComponent implements OnInit {

    @ViewChild("file") file: ElementRef;

    private population: Population = new Population();

    private populationid: string; 

    private isAdd: boolean;

    private uploader: any;

    private baseUrl: string;

    private upload: FileUploader;

    private uploadMessage: string = this.chineseService.config.PLEASE_UPLOAD_FILE;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private populationService: PopulationService,
        private validationService: ValidationService,
        private myModalService: MyModalService,
        private chineseService: ChineseService,
        private rootService: RootService
    ){ }

    ngOnInit(){
        this.rootService.tokenTest().subscribe(result => result,error => error);
        this.dataInit();
        !this.isAdd && this.editInit();      
    }
    // 数据初始化
    private dataInit(): void{
        // 判断新建or编辑
        this.populationid = this.route.snapshot.params["id"] ? this.route.snapshot.params["id"] : undefined;
        this.isAdd = this.populationid ? false : true;
        let url = eval(profiles + ".urlHref") +"/population";
        this.baseUrl = this.isAdd ? url : (url + "/" + this.populationid);
        let method = this.isAdd ? "post" : "put";
        // 上传对象
        let tokenType = window.localStorage.getItem("tokenType");
		let token = window.localStorage.getItem("token");
		let tokens = tokenType + " " + token;
        this.uploader = new FileUploader({
            url:this.baseUrl,
            allowedFileType:["doc"],
            method: method,
            authToken: tokens
        });
        // 监听上传事件
        this.listenUpload();   
    }
    // 编辑
    private editInit(): void{
        //this.uploadMessage
        this.populationService.get(this.populationid).subscribe(
            result => {
                if(result.head.httpCode === 200){
                    let population = result.body;
                    for(let i in population){
                        this.population[i] = population[i];
                    }
                    this.uploadMessage = this.population.fileName;
                }else{
                    this.myModalService.alert(result.body.message);
                }
            },
            error => error
        )
    }
    //上传监听事件
    private listenUpload(): void{
        this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
            this.router.navigate(["/home/population"]);
        };

        this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
            if(status == 401){
                this.router.navigate(["/login"]);
            }
            if(response){
                this.myModalService.alert(JSON.parse(response).message);
            }
            
        }
        this.uploader.onAfterAddingFile = (fileItem: any) => {
            let fileStr = this.file.nativeElement.value;
            this.uploadMessage = this.cutFileName(fileStr);
        }
        this.uploader.onWhenAddingFileFailed = (item:any, filter:any, options:any) => {
            this.myModalService.alert(this.chineseService.config.UPLOAD_FAIL_PLEASE_NORMAL_FILE_FORMAT)
        }
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append("name",this.population.name);
        }
    }
    // 截取文件名
    private cutFileName(str){
        let arr = str.split("\\");
        let fileName = arr[arr.length-1];
        return fileName;
    }

    // 保存
    private save(){
        if(this.validationService.validate()){
            if(!this.uploader.queue[0]){
                if(this.isAdd){
                    this.myModalService.alert(this.chineseService.config.PLEASE_UPLOAD_FILE);
                    return;
                }else{
                    this.populationService.updateName(this.population.id,{
                        name: this.population.name
                    }).subscribe(
                        result => {
                            if(result.head.httpCode === 204){
                                this.router.navigate(["/home/population"]);
                            }else{
                                this.myModalService.alert(result.body.message);
                            }
                        },
                        error => {
                            this.myModalService.alert(error.message)
                        }
                    )
                }       
            }else{
                this.uploader.queue[this.uploader.queue.length-1].upload(); 
            }              
        }else{
           this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE)
        }
        
    }
}