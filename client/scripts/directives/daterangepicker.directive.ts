import { Directive, ElementRef, Renderer,Input,Output,OnDestroy,OnInit } from "@angular/core";

declare var $;

@Directive({
	selector: "[daterangepicker]",
    host: {"(optionsChange)": "doValidateOne($event)"} 
})

export class DaterangepickerDirective implements OnDestroy,OnInit{

    @Input() options;

    constructor(
        private el: ElementRef,
        private renderer: Renderer 
    ) {}

    ngOnDestroy(){
        // $(".daterangepicker").remove();
    }

    doValidateOne($event) {
        
    }

    ngOnInit() {
        this.options={}
         this.options.locale = {  
            applyLabel : '确定',  
            cancelLabel : '取消',  
            fromLabel : '起始时间',  
            toLabel : '结束时间',  
            customRangeLabel : '自定义',  
            daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],  
            monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',  
                    '七月', '八月', '九月', '十月', '十一月', '十二月' ],  
            firstDay : 1  
        }
    }
}