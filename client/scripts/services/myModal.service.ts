/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
//import "jquery-ui/ui/widgets/draggable.js"
declare var $;




@Injectable()
export class MyModalService {

    constructor() { }

    public alert(msg:any){
        let subject = new Subject();
        $("#mask").remove();
        $(".btn").blur();
        $("input").blur();
        $("body").append(
            "<div id='mask' class='mask'>"+
                "<div class='myModal'>"+
                    "<div class='myModal-header'>提示</div>"+
                    "<div class='myModal-msg-box'><div class='myModal-msg'>"+msg+"</div></div>"+
                    "<div class='width-100 mb20 textcenter'><button class='btn btn-primary height38 font14' id='alertConfirm'>确 定</button></div>"+
                "</div>"+
            "</div>"
        );

        $("#alertConfirm").on("click",function(){
            $("#mask").remove();
            document.documentElement.onkeypress = null;
            subject.next();
            
        })
        let that = this;
        document.documentElement.onkeypress = (e) => {	
			if(e.keyCode === 13){
				$("#mask").remove();           
                document.documentElement.onkeypress = null;
                subject.next();
			}	
	    }
        return subject;
        
    }

    public confirm(msg:any){
        let subject = new Subject();
        $("#mask").remove();
        $(".btn").blur();
        $("input").blur();
        $("body").append(
            "<div id='mask' class='mask'>"+
                "<div class='myModal'>"+
                    "<div class='myModal-header'>提示</div>"+
                    "<div class='myModal-msg-box'><div class='myModal-msg'>"+msg+"</div></div>"+
                    "<div class='width-100 mb20'><button class='btn btn-cancel height38 font14 ml310 mr10' id='confirmCancel'>取 消</button><button class='btn btn-primary height38 font14' id='confirmConfirm'>确 定</button></div>"+
                "</div>"+
            "</div>"
        );
        $("#confirmCancel").on("click",function(){
            $("#mask").remove();
            document.documentElement.onkeypress = null;
            subject.next(false);
            
        })
        $("#confirmConfirm").on("click",function(){
            $("#mask").remove();
            document.documentElement.onkeypress = null;
            subject.next(true);
            
        })
        let that = this;
        document.documentElement.onkeypress = (e) => {		
			if(e.keyCode === 13){
				$("#mask").remove();
                document.documentElement.onkeypress = null;  
                subject.next(true);   
                        
			}	
	    }
        return subject;
    }
  
}