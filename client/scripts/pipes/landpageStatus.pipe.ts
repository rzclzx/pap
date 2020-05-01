import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "landpageStatus"})
export class landpageStatusPipe implements PipeTransform {
	transform(code: string): string {
		var kv = {
			"01": "未检查",
			"02": "校验成功",
			"03": "校验失败"
		};
		return kv[code];
	}
}