import { Component, OnInit, Output, EventEmitter, Input,ViewChild } from "@angular/core";
import { ValidationService } from "../../services/validation.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "page-footer",
	template: `
		<div style="color: #85868A;position: absolute;bottom: 0;display: flex;flex-flow: row nowrap;justify-content: space-between;height: 52px;width: 55%;line-height: 52px;overflow: hidden;-webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;font-size: 16px;">
			<div style="margin-left: 22px;">
				<label *ngIf="isAllcheck" class="table-check" style="cursor: pointer;">
					<input type="checkbox" (change)="allChange()" [(ngModel)]="allCheck" class="mb2">
					<span class="hover">全选</span>
				</label>
				<span *ngIf="isAllcheck" style="margin-left: 10px;cursor: pointer;color: #477ECE;" class="hover" (click)="deletes()">删除</span>
				<span *ngIf="isAudit" style="margin-left: 10px;cursor: pointer;color: #477ECE;" class="hover" (click)="audit()">审核</span>
				<span *ngIf="isSynchronize" style="margin-left: 10px;cursor: pointer;color: #477ECE;" class="hover" (click)="sync()">同步</span>
				<span *ngIf="isPrice" style="margin-left: 10px;cursor: pointer;color: #477ECE;" class="hover" (click)="alertPrice()">出价</span>
			</div>
			<div *ngIf="total>0" style="margin-right: 60px;">{{ "当前显示 "+(pageNo*pageSize+1)+" 到 "+(pageNo*pageSize+pageSize > total ? total : pageNo*pageSize+pageSize)+" 条，"+"共 "+total+" 条记录" }}</div>
			<div *ngIf="total>10" style="width: 60px;height: 32px;background-color: #ffffff;border: solid 1px #bebebe;border-radius: 3px;line-height: 32px;position: relative;top: 49%;transform: translateY(-50%);margin-right: 100px;">
				<div style="position: absolute;right: 70px;white-space: nowrap;top: 0;">每页显示</div>
				<select style="width: 100%;height: 100%;border: none;background-color: transparent;padding-left: 10%;" [(ngModel)]="pageSize" (change)="update()">
					<option [ngValue]="10">10</option>
					<option [ngValue]="15">15</option>
					<option [ngValue]="20">20</option>
				</select>
				<div style="position: absolute;left: 70px;white-space: nowrap;top: 0;">条记录</div>
				<span class='camadd-caret'></span>
			</div>
			<div *ngIf="isPrice">
				<modal #priceModal [backdrop]="'static'">
					<modal-header>
						<h4 class="modal-title color-white font16">出价</h4>
					</modal-header>
					<modal-body>
						<div class="mt20 ml100">
							<div class="font16 mb20">已选中 {{ selected.length }} 个活动</div>
							<div *ngIf="showPrice" class="flex-base font16 price-error">
								<div class="line-height38">修改出价为：</div>
								<input class="form-control width175" validation [(ngModel)]="price" [validations]="'required;maxlength:6;rate;plusFloat'" name="price" class="form-control l320" placeholder="不超过6个字符">
								<div class="line-height38 ml10">元</div>
							</div>
						</div>
					</modal-body>
					<modal-footer>
						<button type="button" class="btn btn-default" (click)="priceCancel()">取消</button>
						<button type="button" class="btn btn-primary" (click)="priceConfirm()">确定</button>
					</modal-footer>
				</modal>
			</div>	
				
		</div>
    `
})

export class PageFooterComponent implements OnInit {

	

	@Output() outer: EventEmitter<any> = new EventEmitter();

	@Output() allChangeOuter: EventEmitter<any> = new EventEmitter();

	@Output() deleteOuter: EventEmitter<any> = new EventEmitter();

	@Output() priceOuter: EventEmitter<any> = new EventEmitter();

	@Output() syncOuter: EventEmitter<any> = new EventEmitter();

	@Output() auditOuter: EventEmitter<any> = new EventEmitter();

    @Input() pageNo;

    @Input() pageSize;

    @Input() total;

	@Input() allCheck: boolean;

	@Input() selected: Array<any>;

	@Input() isSynchronize: boolean;

	@Input() isAudit: boolean;

	@Input() isPrice: boolean;

	@Input() showPrice: boolean;

	@Input() isAllcheck: boolean;

	@ViewChild("priceModal") priceModal;


	constructor(
		private validationService: ValidationService,
		private myModalService: MyModalService,
		private chineseService: ChineseService
	) {}

	private columns;

	private price: number;

	ngOnInit() {

	}
    private update(): void{
        this.outer.emit(this.pageSize);
    }

	private allChange(): void{
		this.allChangeOuter.emit(this.allCheck);
	}

	private deletes(): void{
		this.deleteOuter.emit();
	}
	private sync(): void{
		this.syncOuter.emit();
	}
	private audit(): void{
		this.auditOuter.emit();
	}

	//出价

	private alertPrice(): void{
		if(this.selected.length === 0){
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
			return;
		}
		this.showPrice = true;
		this.priceModal.open();
	}

	private priceCancel(): void{
		this.priceModal.close();
		this.showPrice = false;
		this.price = undefined;
	}

	private priceConfirm(): void{
		let event = {
			selected: this.selected,
			price: this.price
		}
		if (this.validationService.validate()) {
			this.priceOuter.emit(event);
			this.priceModal.close();
			this.showPrice = false;
			this.price = undefined;
		} else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}		
				
	}
}