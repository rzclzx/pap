import { Component, OnInit, Output, EventEmitter, Input,ViewChild } from "@angular/core";

@Component({
	selector: "my-modal",
	template: `
		<div class="mask">
            <div class="my-Modal" [ngStyle]="{ width: width + 'px' }">
                <div class='myModal-header'>{{ title }}</div>
                <div #myModal (mousewheel)="preventScroll($event)" class="my-Modal-body" [class.column-scroll]="isScroll">
                    <ng-content></ng-content>
                    <div class='width-100 mt50 flex-end mb38'>
                        <button class="btn btn-default mr10" (click)="cancel()">取消</button>
                        <button class="btn btn-primary mr20" (click)="confirm()">确定</button>
                    </div>
                </div>        
            </div>
        </div>
    `
})

export class MyModalComponent implements OnInit {

    // 基本组件

    // private showModal = false;

	// private closeModal(value){
	// 	if(value){
	// 		this.myModalSubmit();
	// 	}else{
	// 		this.showModal = false;
	// 	}
		
	// }

	// private myModalSubmit(){
	// 	// 提交后操作
	// }

    private isScroll = false;

	@ViewChild("myModal") myModal;

    @Input() width;

    @Input() title;

    @Output() close: EventEmitter<any> = new EventEmitter();
	
	constructor() {}

	ngOnInit() {
        this.isHasScroll();
	}
	
    // 阻止滚动延伸
    private preventScroll(e){    
        if(e.wheelDelta < 0){
            if(this.myModal.nativeElement.scrollTop === this.myModal.nativeElement.scrollHeight - 750){
                e.preventDefault();
            }         
        }else{
            if(this.myModal.nativeElement.scrollTop === 0){
                e.preventDefault();
            }
        }
    }

    public isHasScroll(){
        this.isScroll = this.myModal.nativeElement.scrollHeight > 750 ? true : false;
    }

    private cancel(){
        this.close.emit(false);
    }

    private confirm(){
        this.close.emit(true);
    }

}