import { Component, OnInit, Output, EventEmitter, Input,ViewChild,OnChanges } from "@angular/core";
declare var $;
@Component({
	selector: "progress-bar",
	template: `
        <div id="progress" class="flex-between-center" [ngStyle]="{ width: width + 'px' }">
            <div id="progress-bar" style="flex-grow: 1">     
                <div class="progress progress-striped active mb0" [ngStyle]="{ height: height + 'px' }">
                    <div class="progress-bar progress-bar-info" [ngStyle]="{ width: progress + '%' }"></div>
                </div>
            </div>
            <div id="progress-count" class="color-blue3 pl10 textcenter width-15" [ngStyle]="{ 'font-size': fontSize + 'px' }">{{ progress + "%"}}</div>
        </div>
    `
})

export class ProgressBarComponent implements OnInit,OnChanges {
    // 红
    // <div class="progress progress-striped active height3">
    //     <div class="progress-bar progress-bar-danger" [ngStyle]="{ width:progress*100 + '%' }"></div>
    // </div> 
    // 绿
    // <div class="progress progress-striped active">
    //     <div class="progress-bar progress-bar-success" [ngStyle]="{ width:progress*100 + '%' }"></div>
    // </div> 
    // 黄
    // <div class="progress progress-striped active">
    //     <div class="progress-bar progress-bar-warning" [ngStyle]="{ width:progress*100 + '%' }"></div>
    // </div> 



    private progress: any;

    @Input() width;

    @Input() height;

    @Input() fontSize;

    @Input() Value;

	@Input() minValue;

    @Input() maxValue;
	
	constructor() {}

	ngOnInit() {
        this.getProgress();
	}
    ngOnChanges(){
        this.getProgress();
    }


    private getProgress(){
        this.progress = (((this.Value - this.minValue)/(this.maxValue - this.minValue))*100).toFixed(0);
    }

}