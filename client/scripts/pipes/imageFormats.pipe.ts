import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "imageFormats"})
export class imageFormatsPipe implements PipeTransform {
	transform(code: string): string {
		if(!code)
			return "无";
		var kv = {
			"17": "png",
			"18": "jpg,jpeg",
			"19": "gif",
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