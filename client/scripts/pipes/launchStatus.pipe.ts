import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'launchStatus'})
export class LaunchStatusPipe implements PipeTransform {
	transform(code: string): string {
		var kv = {
			"01": "等待中",
			"02": "等待中",
			"03": "投放中",
			"04": "投放中",
			"05": "已关闭"
		};
		return kv[code];
	}
}