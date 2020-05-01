/**
 * Created by Haoyu Chen on 30-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { Campaign,CampaignTarget } from "../models/campaign.model";
import { Observable } from "rxjs/Observable";
import { BaseService } from "./base.service";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "../../resource/request.js";


@Injectable()
export class CampaignService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/campaign";
	}

    addTmplPrice(data:any): Observable<any> {
        return this.http.put(this.baseUrl + "/addTmplPrice", data, this.getHeadOptions()).map(this.extractData).catch(this.handleError);
    }

	price(ids:string, data:any): Observable<any> {
        return this.http.put(this.baseUrl + "s/price?ids=" + ids, data, this.getHeadOptions()).map(this.extractData).catch(this.handleError);
    }

	date(id: string,date: Object): Observable<any> {
        return this.http.put(this.baseUrl + "s/date/" +id, date,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
    }


}