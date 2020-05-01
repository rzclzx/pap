/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
declare var $;




@Injectable()
export class MaskService {

    constructor() { }

    private timer;

    public add(){
        $("#mask").remove();
        $("body").append(
            "<div id='mask' class='mask' style='background-color:rgba(0,0,0,0.8);'>"+
                '<div id="mask-parent" class="rel" style="width: 200px;height: 200px;">'+
                   '<div class="abs width-25 height3 right0 bgc-white child0"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child1"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child2"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child3"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child4"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child5"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child6"></div>'+
                   '<div class="abs width-25 height3 right0 bgc-white child7"></div>'+
                '</div>'+
            "</div>"
        );
        let myParent = $("#mask-parent");
		let childs = myParent.children();
		let num = 7;
		let act = () => {
			for(let i = 0;i < 8;i++){
				childs[i].style.opacity = ((num - i) % 7)*0.1;
			}
			num ++;
			this.timer = setTimeout(act,200);
		}
		act();
    }

    public remove(){
        clearTimeout(this.timer);
        $("#mask").remove();
    }
  
}