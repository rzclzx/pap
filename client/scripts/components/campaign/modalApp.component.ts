import { Component, ViewChild, OnInit, ElementRef,Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/observable";

import { MyModalService } from "../../services/myModal.service";
import { AppService } from "../../services/app.service";
import { MaskService } from "../../services/mask.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "modal-app",
	templateUrl: "./dist/client/views/campaign/modalApp.html"
})

export class ModalAppComponent implements OnInit {

	subject = new Subject();

	private includeType = "02";

	private excludeType = "02";

	private typeObj = this.chineseService.config.APP_SEARCH_TYPE_OBJ;

	private showDetail = false;

	private isSubmit = false;

	@Input() audits;

	@Input() adx;

	@Input() include;

	@Input() exclude;

	constructor(
		private myModalService: MyModalService,
		private appService: AppService,
		private chineseService: ChineseService
	){}

	ngOnInit(){
		this.include = this.include ? this.include : [];
		this.exclude = this.exclude ? this.exclude : [];
		this.confirmShowDetail();
	}

	submit(){
		if(this.isSubmit){
			return;
		}
		this.isSubmit = true;
		if(this.adx == undefined){
			this.myModalService.alert(this.chineseService.config.PLEASE_CHOICE_ADX);
			return;
		}
		this.appService.getAmount({
			adx: this.adx,
			include: this.include,
			exclude: this.exclude
		}).subscribe(
			result => {
				if(result.head.httpCode === 200){
					this.subject.next({
						adx: this.adx,
						include: this.include,
						exclude: this.exclude,
						amount: result.body.amount
					});
				}else{
					this.myModalService.alert(result.body.message);
				}
			},
			error => {
				this.isSubmit = false;
				this.myModalService.alert(error.message);
			}
		)
	}
	// app搜索
	private searchValidate(ele){
		if(!/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/.test(ele.value)){
			this.myModalService.alert(this.chineseService.config.APP_SEARCH_NAME_VALIDATE);
			return false;
		}
		if(ele.value.length > 100){
			this.myModalService.alert(this.chineseService.config.APP_SEARCH_NAME_VALIDATE);
			return false;
		}
		return true;
	}
	private addInclude(ele){
		if(this.searchValidate(ele)){
			if(this.isExit(ele.value,this.include)){
				this.myModalService.alert(this.chineseService.config.FILTER_WORDS_EXIST);
			}else{
				this.include.push({
					word: ele.value,
					type: this.includeType
				});
				ele.value = "";
			}
		}	
	}
	private deleteInclude(index){
		this.include.splice(index,1);
	}
	private addExclude(ele){
		if(this.searchValidate(ele)){
			if(this.isExit(ele.value,this.exclude)){
				this.myModalService.alert(this.chineseService.config.REMOVE_WORDS_EXIST);
			}else{
				this.exclude.push({
					word: ele.value,
					type: this.excludeType
				});
				ele.value = "";
			}
		}	
	}
	private deleteExclude(index){
		this.exclude.splice(index,1);
	}
	private isExit(value,arr){
		for(let i = 0;i < arr.length;i++){
			if(value === arr[i].word){
				return true;
			}
		}
		return false;
	}
	private toggle(){
		this.showDetail = !this.showDetail;
	}

	private confirmShowDetail(){
		if(this.include.length === 0 && this.exclude.length === 0){
			this.showDetail = false;
		}else{
			this.showDetail = true;
		}
	}
	private addEvent(handler,ele){
		let that = this;
		document.documentElement.onkeypress = (e) => {		
			if(e.keyCode === 13){
				that[handler](ele);
			}	
	    }
	}
	private removeEvent(){
        document.documentElement.onkeypress = null;
	}
	private refreshCondition(adxId){
		if(adxId !== this.adx){
			this.include = [];
			this.exclude = [];
		}
	}
}