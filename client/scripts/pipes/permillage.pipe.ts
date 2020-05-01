import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'permillage'})
export class permillagePipe implements PipeTransform {
	transform(code: number): string {
		return (code*1000).toFixed(2) +'‰';
	}
}