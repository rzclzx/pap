import { Component,OnInit,ViewChild } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

import { LandpageService } from "../../services/landpage.service";
import { ValidationService } from "../../services/validation.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

import { Landpage } from "../../models/landpage.model";

@Component({
	selector: "landpage-form",
	templateUrl: "./dist/client/views/landpage/landpageForm.html"
})

export class LandpageFormComponent implements OnInit {

	landpage: Landpage = new Landpage();

	landpageId: string;

	isNeedEffect: boolean = false;

	errorMessage: string;

	isAdd: boolean;

	codes: Array<string> = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private location:Location,
		private landpageService: LandpageService,
		private validationService: ValidationService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {}

	ngOnInit(){
		this.isAdd = this.route.snapshot.params["id"] ? false : true;
		this.landpageId = this.route.snapshot.params["id"] ? this.route.snapshot.params["id"] : undefined;
		if(this.isAdd){
			this.addInit();
		}else{
			this.editInit();
		}
		
	}

	private error(error): Function{
		let handler = (error) => {
			this.errorMessage = <any>error
		}
		return handler;
	}
	// 取消
	private cancel(): void{
		this.location.back();
	}
	// 保存
	private save(): void{
		if(!this.isNeedEffect)
			delete this.landpage.monitorUrl;
		if(this.validationService.validate()){
			// 新建or编辑
			if(this.isAdd){
				this.landpageService.create(this.landpage)
				.subscribe(
					result => {
						if (result.head.httpCode == 201) {
							this.myModalService.alert(this.chineseService.config.ADD_SUCCESS);
							this.router.navigate(["home/landpage"]);
						}else{
							this.myModalService.alert(result.body.message);
						}
					},
					error => {
						this.myModalService.alert(error.message)
					}
				);
			}else{
				this.landpageService.update(this.landpageId,this.landpage)
				.subscribe(
					result => {
						if (result.head.httpCode == 204) {
							this.myModalService.alert(this.chineseService.config.UPDATE_SUCCESS);
							this.router.navigate(["home/landpage"]);
						}else{
							this.myModalService.alert(result.body.message);
						}
					},
					error => {
						this.myModalService.alert(error.message)
					}
				);
			}
			
		}else{
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
	}
	// 新建
	private addInit(): void{
		this.landpage.codes = [""];
		this.codes = [""];
	}
	// 编辑
	private editInit(): void{
		this.landpageService.get(this.landpageId).subscribe(
			result => {
				if (result.head.httpCode == 200) {
					this.landpage = result.body;
					this.landpage.monitorUrl && (this.isNeedEffect = true);
					if(!this.landpage.codes || this.landpage.codes.length === 0){
						this.landpage.codes = [""];
						this.codes = [""];
					}else{
						for(let i=0;i<this.landpage.codes.length;i++){
							this.codes[i] = this.landpage.codes[i];
						}
					}
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.myModalService.alert(error.message)
			}
		)		
	}
	// 添加监测码
	private addCode(i): void{
		this.landpage.codes.push("");
		this.codes.push("");
	}

	// 删除监测码
	private deleteCode(i): void{
		this.landpage.codes.splice(i,1);
		this.codes.splice(i,1);
	}
}