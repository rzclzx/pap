/**
 * Created by Haoyu Chen on 07-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable,Inject } from "@angular/core";
import { Headers, Http, Response, URLSearchParams,RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router,ActivatedRoute } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class AdvertiserService extends BaseService{


	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/advertiser";
	}

	public adx(id: string,options: Object): Observable<any> {
		return this.http.put(this.baseUrl + "s/adx/" + id,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

}