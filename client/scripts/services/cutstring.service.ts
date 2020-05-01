/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";



@Injectable()
export class CutStringService {

    public cutLongstring(str: any,len: number): string{
		let st = str.toString();
        let maxlength = 0;
        let newStr = "";
        for(let i=0;i<st.length;i++){
            if(/[^\u0000-\u00FF]/.test(st[i])){
                maxlength = maxlength + 2;             
            }else{
                maxlength ++;
            }
            newStr += st[i];
            if(maxlength >= len){
                newStr += "...";
                break;
            }
            
        }
        return newStr;
	}

}