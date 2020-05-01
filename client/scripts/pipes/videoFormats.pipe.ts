import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "videoFormats"})
export class videoFormatsPipe implements PipeTransform {
	transform(code: string): string {
		if(!code)
			return "无";
		var kv = {
			"33": "flv",
			"34": "mp4",
			"0": "未知"
		};
		let codeArr = [],newCode = "";
		codeArr = code.split(",");
		for(let i=0,len=codeArr.length;i<len;i++){
			newCode += kv[codeArr[i]] ? kv[codeArr[i]]+(i!=len-1 ? ",":"") : "";
		}
		return newCode;
	}
}