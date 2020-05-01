/**
 * Created by Haoyu Chen on 07-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { Landpage } from "../models/landpage.model";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";

//import { Base } from "./base.service"

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";

@Injectable()
export class LandpageService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/landpage";
	}

	check(id: string): Observable<any> {
		return this.http.get(this.baseUrl + "/check/" + id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

}