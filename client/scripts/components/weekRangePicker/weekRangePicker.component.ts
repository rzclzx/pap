import { Component, OnInit, AfterViewChecked, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { WeekRangePickerService } from "../../services/weekRangePicker.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "week-range-picker",
	templateUrl: "./dist/client/views/weekRangePicker/weekRangePicker.html",
	providers: [ WeekRangePickerService ]
})

export class WeekRangePickerComponent implements OnInit,AfterViewChecked,OnDestroy {

	private data:Array<any> = [];

	private itemWidth:string;

	private halfDayWidth:string;

	private isOnSelect:boolean = false;

	private resizeStr:string = "orientationchange" in window ? "orientationchange" : "resize";

	private mainVisibility = "hidden";

	firstWidth:string;

	weekNames = this.chineseService.config.WEEKS_ARRAY_ONE_SEVEN

	basePosition;

	orignalPosition;

	nowPosition;

	resizeHandler:EventListenerOrEventListenerObject = (function(that){
		return function(){
			that.resizeArea();
		}
	})(this);

	@ViewChild("weekNameTmpl") weekNameTmpl: ElementRef;
	@ViewChild("weekRowTmpl") weekRowTmpl: ElementRef;

	constructor(private weekRangePickerService:WeekRangePickerService,private chineseService: ChineseService){
		this.resizeHandler = (function(that){
			return function(){
				that.resizeArea();
			}
		})(this)
		this.setData(this.weekRangePickerService.getInitData());
	}

	ngOnInit() {
		this.firstWidth = "90px";
	}

	ngAfterViewChecked(){
		window.addEventListener(this.resizeStr,this.resizeHandler);
		setTimeout(()=>{
			this.resizeArea();
			this.mainVisibility = "visible";
		},1);
	}

	setData = function(data){
		this.data = data;
	}

	build(){
		this.setData(this.weekRangePickerService.getInitData());
		window.addEventListener(this.resizeStr,this.resizeHandler);
		setTimeout(()=>{
			this.resizeArea();
			this.mainVisibility = "visible";
		},1);
	}

	destory(){
		window.removeEventListener(this.resizeStr,this.resizeHandler);
	}

	ngOnDestroy(){
		window.removeEventListener(this.resizeStr,this.resizeHandler);
	}

	getData(){
		return this.data;
	}

	onSelectStart(data){}

	onSelecting(data){}

	onSelectEnd(data){}

	setSelecting(position,basePosition,status){
		this.changeStatus(position,basePosition,(i,j)=>{
			this.data[i][j].selecting = status;
		})
	}

	setSeleted(position,basePosition){
		this.changeStatus(position,basePosition,(i,j)=>{
			this.data[i][j].selected ^= 1;
		})
	}

	changeStatus = function(position,basePosition,callback:Function){
		var minY = position[0]-basePosition[0]>0 ? basePosition[0] : position[0];
		var maxY = position[0]-basePosition[0]>0 ? position[0] : basePosition[0];
		var minX = position[1]-basePosition[1]>0 ? basePosition[1] : position[1];
		var maxX = position[1]-basePosition[1]>0 ? position[1] : basePosition[1];
		for(var i=minY;i<=maxY;i++)
			for(var j=minX;j<=maxX;j++)
				callback && callback(i,j)
	};
	
	private _onSelectStart(i:number,j:number){
		this.isOnSelect = true;
		this.orignalPosition = this.basePosition = [i,j];
		this.setSelecting(this.orignalPosition,this.basePosition,1);
		this.onSelectStart(this.data);
	}

	private _onSelecting(i:number,j:number){
		this.setSelecting(this.orignalPosition,this.basePosition,0);
		this.setSelecting([i,j],this.basePosition,1);
		this.orignalPosition = [i,j];
		this.onSelecting(this.data)
	}

	private _onSelectEnd(i:number,j:number){
		this.setSelecting(this.orignalPosition,this.basePosition,0);
		this.setSeleted([i,j],this.basePosition);
		this.isOnSelect = false;
		this.onSelectEnd(this.data);
	}

	private cancelSelectText(){
		return false;
	}

	private resizeArea(){
		let widthLeft = this.weekRowTmpl.nativeElement.offsetWidth - this.weekNameTmpl.nativeElement.offsetWidth -1;
		this.halfDayWidth = widthLeft/2 + "px";
		this.itemWidth = widthLeft/24 + "px";
	}
}