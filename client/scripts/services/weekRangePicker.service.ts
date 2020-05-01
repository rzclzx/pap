/**
 * Created by Haoyu Chen on 30-12-2016.
 */

/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from "@angular/http";
import { Campaign,CampaignTarget } from "../models/campaign.model";
import { Observable } from "rxjs/Observable";

import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";


@Injectable()
export class WeekRangePickerService {
    public getInitData(){
		let data = [];
		for(let i=0;i<7;i++){
			data[i] = [];
			for(let j=0;j<24;j++)
				data[i][j] = { selecting:0,selected:0 };
		}
		return data;
	};

    public getTimeRange = function(data,isMinNeed?){
		let timeRange = [];
		for(let i=0;i<=6;i++){
			let flag = 0,min = 0,max =0,tmpRange = [];
			for(let j=0;j<=23;j++){
				if(data[i][j].selected){
					if(!flag){
						min = j;
						flag ^= 1;
					}
				}else{
					if(flag){
						max = j-1;
						flag ^= 1;
						tmpRange.push(min+(isMinNeed?":00":"")+"-"+max+(isMinNeed?":59":""));
					}
				}
			}
			if(flag){
				max = 23;
				flag ^= 1;
				tmpRange.push(min+(isMinNeed?":00":"")+"-"+max+(isMinNeed?":59":""));
			}
			if(tmpRange.length){
				timeRange.push({week:i,ranges:tmpRange});
			}
		}
		return timeRange;
	}
}