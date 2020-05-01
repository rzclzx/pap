import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Advertiser } from "../../models/advertiser.model";
import { AdvertiserService } from "../../services/advertiser.service";
import { ProjectService } from "../../services/project.service";
import { ValidationService } from "../../services/validation.service";
import { CutStringService } from "../../services/cutstring.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";
import { Project } from "../../models/project.model";
import { Kpi } from "../../models/kpi.model";
declare var $;
@Component({
	selector: "project-form",
	templateUrl: "./dist/client/views/project/projectForm.html"
})


export class ProjectFormComponent implements OnInit {

	private advertisers: Advertiser[];
	private project = new Project();
	private kpis: Kpi[];
	private errorMessage;
	private advertiser: Advertiser;

	private id: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private projectService: ProjectService,
		private validationService: ValidationService,
		private advertiserService: AdvertiserService,
		private cut: CutStringService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {
		this.id = this.route.snapshot.params["id"];
	}

	ngOnInit() {
		// 所有广告主
		this.advertiserService.list()
			.subscribe(
				result => {
					if (result.head.httpCode == 200) {
						let items = result.body.items || [];
						if(items.length === 0){
							this.myModalService.alert(this.chineseService.config.PLEASE_CREATE_ADVERTISER);
							return;
						}
						this.advertisers = items;
						this.kpis = this.advertisers[0].kpis;
						if (this.id) this.getProject();
					}
				},
				error => this.errorMessage = <any>error
			);
	}

	getProject() {
		this.projectService.get(this.id).subscribe(
			result => {
				if (result.head.httpCode == 200) {
					this.project = result.body;
					for(let i=0,len=this.advertisers.length;i<len;i++){
						if(this.advertisers[i].id == this.project.advertiserId){
							this.advertiser = this.advertisers[i];
							this.kpis = this.advertiser.kpis;
						}
					}
				}
			},
			error => this.errorMessage = <any>error
		);
	}

	selectAdvertiser() {
		this.kpis = this.advertiser.kpis;
		this.project.advertiserId = this.advertiser.id;
	}

	cancel() {
		this.router.navigate(["home/project"]);
	}

	save() {
		if (this.validationService.validate()) {
			this.saveProject().subscribe(
				result => {
					if ((this.id && result.head.httpCode == 204) || (!this.id && result.head.httpCode == 201)){
						this.router.navigate(["home/project"]);
					}else{
						this.myModalService.alert(result.body.message);
					}
				},
				error => {
					this.myModalService.alert(error.message)
				}
			);
		} else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
	}

	saveProject(){
		return this.id ? this.projectService.update(this.id, this.project) : this.projectService.create(this.project)
	}
	//名称过长截取
	private cutLongstring(name: string): string{
		let str;
		if(name.length > 15){
			str = name.slice(0,14)+"...";
		}else{
			str = name;
		}
		return str;
	}
	private gotoProject(): void{
		this.router.navigate(["/home/project"]);
	}
}