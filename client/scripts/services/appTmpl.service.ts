/**
 * Created by Haoyu Chen on 07-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response } from "@angular/http";
import { Advertiser } from "../models/advertiser.model";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class AppTmplService extends BaseService{

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/tmpl";
	}

	image(adxId): Observable<any> {
		return this.http.get(this.baseUrl + "/images?adxId=" + adxId,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

    video(adxId): Observable<any> {
		return this.http.get(this.baseUrl + "/videos?adxId=" + adxId,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

    infoflow(adxId): Observable<any> {
		return this.http.get(this.baseUrl + "/infoflows?adxId=" + adxId,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	getimage(id: string): Observable<any> {
		return this.http.get(this.baseUrl + "/image/" + id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

    getvideo(id: string): Observable<any> {
		return this.http.get(this.baseUrl + "/video/" + id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

    getinfoflow(id: string): Observable<any> {
		return this.http.get(this.baseUrl + "/infoflow/" + id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}


}