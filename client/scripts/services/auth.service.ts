/**
 * Created by Haoyu Chen on 07-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response,RequestOptions } from "@angular/http";
import { Auth } from "../models/auth.model";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class AuthService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/auth";
	}

	login(auth: Auth): Observable<any> {
		this.headers = new Headers({"Content-Type":"application/json"});
		this.requestOptions = new RequestOptions({ headers: this.headers,withCredentials:true});
		return this.http.post(this.baseUrl , auth,this.requestOptions).map(this.extractData).catch(this.handleError);
	}

	logout(userId: string): Observable<any> {
		return this.http.delete(this.baseUrl + '/'+userId,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}


}