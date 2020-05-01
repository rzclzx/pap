/**
 * Created by Haoyu Chen on 07-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response } from "@angular/http";
import { Advertiser } from "../models/advertiser.model";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";

@Injectable()
export class PopulationService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/population";
	}
	updateName(id: string, options: any): Observable<any> {
		return this.http.put(this.baseUrl + "/name/" + id, options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
}