import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/observable";

import { WeekRangePickerComponent } from "../weekRangePicker/weekRangePicker.component";
import { WeekRangePickerService } from "../../services/weekRangePicker.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "modal-week-range",
	templateUrl: "./dist/client/views/campaign/modalWeekRange.html",
	providers: [ WeekRangePickerService ]
})
export class ModalWeekRangeComponent implements OnInit {

	timeRange = [];

	ngOnInit(){
        this.weekRangePicker.onSelectEnd = (data) => {
            this.timeRange = this.weekRangePickerService.getTimeRange(data);
        }
	}

	@ViewChild(WeekRangePickerComponent)
	weekRangePicker: WeekRangePickerComponent;

	constructor(private weekRangePickerService:WeekRangePickerService,private myModalService: MyModalService,private chineseService: ChineseService){}

	private _$result:Subject<any> = new Subject<string[]>();
	get $result(): Observable<string[]> { return this._$result.asObservable(); }

	init(data){
		let errorFlag:boolean = false;
		this.weekRangePicker.setData(this.weekRangePickerService.getInitData());
		for(let i=0,len=data.length;i<len;i++){
			if(typeof data[i] !== "string"||data[i].length != 4){
				errorFlag = true;
				this.myModalService.alert(this.chineseService.config.DATA_FORMAT_ERROR_PLEASE_CHOICE_AGAIN);
				break;
			}else{
				let x = data[i].substring(2,4)*1, y = data[i].substring(0,2)*1-1;
				this.weekRangePicker.setSeleted([y,x],[y,x]);
			}
		}
		if(errorFlag)
			this.weekRangePicker.setData(this.weekRangePickerService.getInitData());
		this.timeRange = this.weekRangePickerService.getTimeRange(this.weekRangePicker.getData());
	}

	submit(){
		let data = this.weekRangePicker.getData(),arr = [];
		for(let i=0,len=data.length;i<len;i++){
			for(let j=0,len=data[i].length;j<len;j++){
				if(data[i][j].selected){
					arr.push("0"+(i+1)+((j>9?"":"0")+j)+"");
				}
			}
		}
		this._$result.next(arr);
	}
}