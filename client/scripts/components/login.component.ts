/// <reference path="../../typings/index.d.ts" />

import { Component,OnInit } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { AuthService } from "../services/auth.service";
import { BaseService } from "../services/base.service";
import { AdvertiserService } from "../services/advertiser.service";
import { MyModalService } from "../services/myModal.service";
import { ChineseService } from "../services/chinese.service";
import { RootService } from "../services/root.service";
import { Auth } from "../models/auth.model";

declare var $;

@Component({
	selector: "ng-login",
	templateUrl: "./dist/client/views/login.html"
})

export class LoginComponent implements OnInit { 

	auth: Auth = new Auth();

	errorMessage: string = "";

	userId: string;

	private tokenType: string;

	private token: string;

	private toChinese: any = {
		"User do not exist": this.chineseService.config.USERNAME_NOT_EXIST,
		"Request parameter incorrect": this.chineseService.config.USERNAME_OR_PASSWORD_NOT_EXIST,
		"Password is incorrect": this.chineseService.config.PASSWORD_ERROR
	}

	constructor(
		private authService: AuthService,
		private baseService: BaseService,
		private advertiserService: AdvertiserService,
		private router: Router,
		private myModalService: MyModalService,
		private chineseService: ChineseService,
		private rootService: RootService
	) {}

	ngOnInit() {
		this.removeDirtyModal();
		this.rootService.tokenTest().subscribe(
			result => {
				this.router.navigate(["/home/project"]);
			},
			error => error
		);
		let that = this;
		document.documentElement.onkeypress = (e) => {
			setTimeout(() => {
				that.keyLogin(e,that);
			},1);
	    }
    }

	keyLogin(event,that){
		if(event.keyCode === 13){
			that.authService.login(that.auth)
				.subscribe(
					resultInfo => {
						if(resultInfo.head.httpCode === 201){
							this.userId = resultInfo.body.userid;
							this.tokenType = resultInfo.body.tokenType;
							this.token = resultInfo.body.token;
							window.localStorage.setItem('loginUserId',this.userId);
							window.localStorage.setItem('tokenType',this.tokenType);
							window.localStorage.setItem('token',this.token);
							document.documentElement.onkeypress = null;
							this.gotoHome(resultInfo);
						}
					},
					error => {
						let message = this.toChinese[error.message] || error.message;
						let subject = this.myModalService.alert(message);
						subject.subscribe({
							next: () => {
								let that = this;
								document.documentElement.onkeypress = (e) => {
									setTimeout(() => {
										that.keyLogin(e,that);
									},1);
								}
							}
						})
					});
		}
		
	}

	submitLogin() {
		this.authService.login(this.auth)
			.subscribe(
				resultInfo => {
					if(resultInfo.head.httpCode === 201){
						this.userId = resultInfo.body.userid;
						this.tokenType = resultInfo.body.tokenType;
						this.token = resultInfo.body.token;
						window.localStorage.setItem('loginUserId',this.userId);
						window.localStorage.setItem('tokenType',this.tokenType);
						window.localStorage.setItem('token',this.token);
						document.documentElement.onkeypress = null;
						this.gotoHome(resultInfo);
					}			
				},
				error => {
					let message = this.toChinese[error.message] || error.message;
					let subject = this.myModalService.alert(message);
					subject.subscribe({
						next: () => {
							let that = this;
							document.documentElement.onkeypress = (e) => {
								setTimeout(() => {
									that.keyLogin(e,that);
								},1);
							}
						}
					})
				});
	}

	gotoHome(resultInfo) {
		if (resultInfo && resultInfo.head.httpCode == 201) {
			this.router.navigate(["/home/project"]);
		}
	}

	private removeDirtyModal(){
		$("#mask").remove();
        $(".btn").blur();
        $("input").blur();
	}
}