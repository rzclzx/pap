import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "creativeType"})
export class creativeTypePipe implements PipeTransform {
	transform(code: string): string {
		var kv = {
			"01": "图片",
			"02": "视频",
			"03": "信息流"
		};
		return kv[code];
	}
}