
/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response } from "@angular/http";
import { Industry } from "../models/Industry.model";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class IndustryService extends BaseService {

	constructor(protected http: Http,protected router: Router) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/industrie";
	 }

}