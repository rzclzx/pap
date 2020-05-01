import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "creativeStatus"})
export class creativeStatusPipe implements PipeTransform {
	transform(code: string): string {
		var kv = {
			"01": "未审核",
			"02": "审核中",
			"03": "审核通过",
			"04": "审核不通过"
		};
		return kv[code];
	}
}