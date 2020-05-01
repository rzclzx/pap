/**
 * Created by Haoyu Chen on 20-1-2017.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class AppService extends BaseService{

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/app";
	}

	getAmount(options): Observable<any> {
		return this.http.post(this.baseUrl,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	appSynchro(): Observable<any> {
        return this.http.get(this.baseUrl + "/synAppInfo" , this.getHeadOptions()).map(this.extractData).catch(this.handleError);
    }
}