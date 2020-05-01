import { Directive, ElementRef, Renderer,Input, OnDestroy, OnInit, OnChanges,AfterViewInit } from "@angular/core";

import { ValidationService } from "../services/validation.service"

@Directive({
	selector: "[validation]",
    host: {"(ngModelChange)": "doValidateOne($event)"} 
})

export class ValidationDirective implements OnDestroy,OnChanges,OnInit,AfterViewInit{

    @Input() ngModel

    @Input() validations

    @Input() validName

    private name: any;

    private ele: any;

    doValidateOne(event) {
        this.validationService.validateOne(this.el.nativeElement.name,event);
    }

    constructor(
        private el: ElementRef,
        private renderer: Renderer ,
        private validationService: ValidationService,
    ) {}


    ngOnInit(){
        
        
    }
    ngAfterViewInit(){
        this.validationService.setValidateCache(this.ngModel,this.el.nativeElement,this.validations,this.validName);
    }

    ngOnChanges(){
        this.validationService.setValidateCache(this.ngModel,this.el.nativeElement,this.validations,this.validName);
    }

    ngOnDestroy() {
        this.validationService.removeValidateCache(this.el.nativeElement.name);
        this.validationService.removeError(this.el.nativeElement,this.el.nativeElement.name);
    }
    
}