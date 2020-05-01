import { Component, OnInit, Output, EventEmitter, Input,ViewChild,OnDestroy } from "@angular/core";

@Component({
	selector: "loading-modal",
	template: `
		<div #parent class="rel">
			<div class="abs width-25 height3 right0 bgc-black child0"></div>
			<div class="abs width-25 height3 right0 bgc-black child1"></div>
			<div class="abs width-25 height3 right0 bgc-black child2"></div>
			<div class="abs width-25 height3 right0 bgc-black child3"></div>
			<div class="abs width-25 height3 right0 bgc-black child4"></div>
			<div class="abs width-25 height3 right0 bgc-black child5"></div>
			<div class="abs width-25 height3 right0 bgc-black child6"></div>
			<div class="abs width-25 height3 right0 bgc-black child7"></div>
		</div>
    `
})

export class LoadingModalComponent implements OnInit,OnDestroy {

	@ViewChild("parent") parent;

	@Input() size: number;

	private timer;
	
	constructor() {}

	ngOnInit() {

		let myParent = this.parent.nativeElement;
		myParent.style.width = this.size + "px";
		myParent.style.height = this.size + "px";
		let childs = myParent.children;
		let num = 7;
		let act = () => {
			for(let i = 0;i < childs.length;i++){
				childs[i].style.opacity = ((num - i) % 7)*0.1;
			}
			num ++;
			this.timer = setTimeout(act,200);
		}
		act();
		
	}
	ngOnDestroy(){
		clearTimeout(this.timer);
	}


}