import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { WeekRangePickerComponent } from "../components/weekRangePicker/weekRangePicker.component";

@NgModule({
	imports: [ 
		CommonModule,
	],
	declarations: [ 
		WeekRangePickerComponent
	],
	exports: [
		WeekRangePickerComponent
	]
})

export class WeekRangePickerModule { }