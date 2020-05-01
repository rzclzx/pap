/**
 * Created by Haoyu Chen on 20-1-2017.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";

@Injectable()
export class RegionService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/region";
	}
}