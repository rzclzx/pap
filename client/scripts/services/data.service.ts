/**
 * Created by Haoyu Chen on 11-1-2017.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Subject }    from 'rxjs/Subject';
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";

@Injectable()
export class DataService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/data";
	}

	list(type:string, options?): Observable<any> {

        let params = new URLSearchParams();

		if(options)
			for(let key in options)
				params.set(key, options[key])
		return this.http.get(this.baseUrl + "/" + type + (options ? "?"+ params.toString() : ""),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	listTrafficdata(options): Observable<any> {
		let params = new URLSearchParams();
		for(let key in options){
			params.set(key,options[key]);
		}
		return this.http.get(this.baseUrl + "/traffic-data" + (options ? "?"+ params.toString() : ""),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	importList(options?): Observable<any> {
		let params = new URLSearchParams();

		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"/effect/list"+ (options ? "?"+ params.toString() : ""),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
}