/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { Project } from "../models/project.model";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { BaseService } from "./base.service";
import "../../resource/request.js";
@Injectable()
export class ProjectService extends BaseService {

	constructor(
		protected http: Http,
		protected router: Router
	) {
		super(http,router)
		this.baseUrl += this.getBaseurl() + "/project";
	}

	public effectName(id: string, value): Observable<any> {
		return this.http.put(this.baseUrl + "/effect/name/" + id, { name: value },this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public staticName(id: string, value): Observable<any> {
		return this.http.put(this.baseUrl + "/staticval/name/" + id, { name: value },this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public staticValue(id: string, value): Observable<any> {
		return this.http.put(this.baseUrl + "/staticval/value/" + id, { value: value },this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	public enable(id: string, options): Observable<any> {
		return this.http.put(this.baseUrl + "/effect/enable/" + id, options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}

	public createStatic(options): Observable<any> {
		return this.http.post(this.baseUrl + "/staticval", options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public getRule(id): Observable<any> {
		return this.http.get(this.baseUrl +"/rule/"+ id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public createRule(options): Observable<any> {
		return this.http.post(this.baseUrl + "/rule", options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public updateRule(id: string, options): Observable<any> {
		return this.http.put(this.baseUrl + "/rule/" + id, options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public deletestaticval(ids): Observable<any> {
		return this.http.delete(this.baseUrl +"/staticvals"+ "?ids=" + ids,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public deleterule(ids): Observable<any> {
		return this.http.delete(this.baseUrl +"/ruleGroup"+ "?ids=" + ids,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public deleteruleDetail(ids): Observable<any> {
		return this.http.delete(this.baseUrl +"/rules"+ "?ids=" + ids,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public listRuleGroups(options?): Observable<any> {
		let params = new URLSearchParams();
		if(options)
			for(let key in options)
				params.set(key, options[key])

		return this.http.get(this.baseUrl +"/ruleGroups"+ (options ? "?"+ params.toString() : ""),this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public createRulegroup(options): Observable<any> {
		return this.http.post(this.baseUrl + "/ruleGroup", options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public updateRulegroup(id: string, options): Observable<any> {
		return this.http.put(this.baseUrl + "/ruleGroup/" + id, options,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
	public getRulegroup(id: string): Observable<any> {
		return this.http.get(this.baseUrl +"/ruleGroup/"+ id,this.getHeadOptions()).map(this.extractData).catch(this.handleError);
	}
}