/**
 * Created by Haoyu Chen on 30-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { CreativeImage,CreativeVideo,CreativeInfoFlow } from "../models/Creative.model";
import { Observable } from "rxjs/Observable";
import { Subject }    from 'rxjs/Subject';
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";


@Injectable()
export class CreativeService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/creative";
	}

    createCreative(type:string, creative: CreativeImage|CreativeVideo|CreativeVideo): Observable<any> {
		return this.http.post(this.baseUrl + "/" +type, creative,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	updateCreative(id: string, type:string, creative: CreativeImage|CreativeVideo|CreativeVideo): Observable<any> {
		return this.http.put(this.baseUrl + "/" +type +"/"+ id, creative,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	changePrice(id:string, price){
		return this.http.put(this.baseUrl + "/price/" + id,{ price:price },this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	audits(ids: string): Observable<any> {
		return this.http.put(this.baseUrl + "s/audit?ids="+ids,{},this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	synchronize(id: string): Observable<any> {
		return this.http.put(this.baseUrl + "/synchronize/" + id,{},this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	image(id: string,options: Object): Observable<any> {
		return this.http.put(this.baseUrl + "/image/" + id,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	video(id: string,options: Object): Observable<any> {
		return this.http.put(this.baseUrl + "/video/" + id,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	infoflow(id: string,options: Object): Observable<any> {
		return this.http.put(this.baseUrl + "/infoflow/" + id,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	
	enable(id: string,options: Object): Observable<any> {
		return this.http.put(this.baseUrl + "s/enable/" + id,options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	listMaterial(options?): Observable<any> {
		let params = new URLSearchParams();
		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"s/material"+ (options ? "?"+ params.toString() : ""),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
}