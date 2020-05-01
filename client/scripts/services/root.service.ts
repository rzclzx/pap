/**
 * Created by Haoyu Chen on 20-1-2017.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response,URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class RootService extends BaseService{

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl();
	}

	public sizeList(): Observable<any> {
		return this.http.get(this.baseUrl +"/sizes",this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	public nobidList(options): Observable<any> {
		let params = new URLSearchParams();
		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"/analysis/nobids?"+ params.toString(),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}


	public tokenTest(): Observable<any> {
		return this.http.get(this.baseUrl +"/industries",this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public adxAnalysisList(options): Observable<any> {
		let params = new URLSearchParams();
		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"/analysis/flows?"+ params.toString(),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	public bidList(options): Observable<any> {
		let params = new URLSearchParams();
		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"/analysis/bids?"+ params.toString(),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

    
}