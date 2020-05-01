import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/observable";

import { RegionService } from "../../services/region.service"
import { ChineseService } from "../../services/chinese.service";

@Component({
	selector: "modal-region",
	templateUrl: "./dist/client/views/campaign/modalRegion.html",
	providers:[RegionService]
})

export class ModalRegionComponent implements OnInit {

	@ViewChild("searchInput") searchInput;

    private timeRangeList;

	private errorMessage:string;

	private regions;

	private regionsCache;

	public regionData:string[] = [];

	private selectedList:any[] = [];

	private _$result:Subject<any> = new Subject<any[]>();

	get $result(): Observable<any[]> { return this._$result.asObservable(); };

	constructor(private regionService:RegionService,private chineseService: ChineseService){}

	ngOnInit(){}

	
	// 获取定向数据
	public getRegion(){
		this.regionService.list().subscribe(
			resultInfo => {
				if(resultInfo.head.httpCode == 200){
					let arr = resultInfo.body.items;
					this.regions = this.clone(arr);
					this.regionsCache = this.clone(arr);
					for(let i = 0;i<arr.length;i++){
						this.regions[i].show = false;
						this.regionsCache[i].show = false;
					}
					this.initRegionStatus();
					this.setRegionSelected();
				}
					
			},
			error => this.errorMessage = <any>error
		);
	}
	// 初始化地域定向
	private initRegionStatus() {
		for (let i=0,len=this.regions.length; i<len; i++) {
			this.regions[i].checked = this.regionData.indexOf(this.regions[i].id) < 0 ? false : true;
			if(!this.regions[i].citys)
				continue;
			for(let j=0,len=this.regions[i].citys.length;j<len;j++){
				this.regions[i].citys[j].checked = this.regionData.indexOf(this.regions[i].citys[j].id) < 0 ? false : true;
			}
		}
	}
	// 省份选择全选城市
	private selectAll(item) {
		if (!item.citys) {
			return;
		}
		for (let i=0, len=item.citys.length; i<len; i++){
			item.citys[i].checked = item.checked;
		}
	}
	// 下拉显示
	private toggleRegion(v) {
		v.show = !v.show;
	}
	// 重置右选框下拉显示
	private reToggleRegion(){
		for(let i = 0;i < this.selectedList.length;i++){
			if(!this.selectedList[i].selected){
				this.selectedList[i].show = true;
			}else{
				this.selectedList[i].show = false;
			}
		}
	}
	// 添加
	private setRegionSelected() {
		// 存储所有右选框id
		let selectedListId = [];
		for(let i = 0;i < this.selectedList.length;i++){
			selectedListId.push(this.selectedList[i].id);
			if(this.selectedList[i].citys){
				for(let j = 0;j < this.selectedList[i].citys.length;j++){
					selectedListId.push(this.selectedList[i].citys[j].id);
				}
			}
		}
		for(let i = 0;i < this.regions.length;i++){
			// 如果省份被选择
			if(this.regions[i].checked){
				// 判断右选框是否已经存在
				let isExist = selectedListId.indexOf(this.regions[i].id) === -1 ? false : true;
				if(!isExist){
					// 通过缓存数组存入完整省份
					let indexArr = this.readIndex(this.regionsCache,this.regions[i]);				
					this.selectedList.push(this.clone(this.regionsCache[indexArr[0]]));
					this.selectedList[this.selectedList.length-1].selected = true;
					this.regions[i].selected = true;
					this.regions[i].checked = false;
					// 省下如果有城市则将左选框城市属性重置
					if(this.regions[i].citys){
						for(let x = 0;x < this.regions[i].citys.length;x++){
							this.regions[i].citys[x].selected = true;
							this.regions[i].citys[x].checked = false;
						}
					}
					
				}else{
					// 如果右选框已经存在
					let indexArr = this.readIndex(this.selectedList,this.regions[i]);				
					let indexArr1 = this.readIndex(this.regionsCache,this.regions[i]);					
					this.selectedList[indexArr[0]] = this.clone(this.regionsCache[indexArr1[0]]);
					this.selectedList[indexArr[0]].selected = true;
					this.regions[i].selected = true;
					this.regions[i].checked = false;
					if(this.regions[i].citys){
						for(let x = 0;x < this.regions[i].citys.length;x++){
							this.regions[i].citys[x].selected = true;
							this.regions[i].citys[x].checked = false;
						}
					}													
				}
			}else{
				// 如果省份不被选择
				let citys = [];
				let father;
				let hasFather;
				// 记录添加城市时的父级index从而切换城市满时切换省级选中
				let index;
				if(this.regions[i].citys){
					// 判断右选框父级存在否
					hasFather = selectedListId.indexOf(this.regions[i].id) === -1 ? false : true;
					// 如果右选框不存在则存入citys
					for(let j = 0;j < this.regions[i].citys.length;j++){
						if(this.regions[i].citys[j].checked){
							let isExist = selectedListId.indexOf(this.regions[i].citys[j].id) === -1 ? false : true;
							if(!isExist){
								citys.push(this.clone(this.regions[i].citys[j]));
								this.regions[i].citys[j].selected = true;
								this.regions[i].citys[j].checked = false;
							}else{
								this.regions[i].citys[j].checked = false;
							}
						}					
					}
					// 先判断是否存储城市，然后根据是否有父级添加城市
					if(citys.length > 0){
						if(hasFather){
							let indexArr = this.readIndex(this.selectedList,this.regions[i]);
							this.selectedList[indexArr[0]].citys = this.selectedList[indexArr[0]].citys.concat(citys);
							index = indexArr[0];
							
						}else{
							father = this.clone(this.regions[i]);
							father.citys = citys;
							this.selectedList.push(father);
							index = this.selectedList.length-1;
						}
						// 添加城市满时切换为省级选中
						let indexArr = this.readIndex(this.regionsCache,this.selectedList[index]);
						if(this.regionsCache[indexArr[0]].citys.length === this.selectedList[index].citys.length){
							this.selectedList[index].selected = true;
							this.regions[i].selected = true;							
						}										
					}				
				}
			}
		}
		// 重置右选框下拉与否
		this.reToggleRegion();
	}
	// 全选
	private selectedAll(){
		for(let i = 0;i<this.regions.length;i++){
			this.regions[i].checked = true;
		}
		this.setRegionSelected();
	}
	// 删除省份
	private deleteRegion(v){
		let indexArr = this.readIndex(this.regions,v);
		if(indexArr[2]){
			this.regions[indexArr[0]].selected = false;
			if(this.regions[indexArr[0]].citys){
				for(let j = 0;j < this.regions[indexArr[0]].citys.length;j++){
					this.regions[indexArr[0]].citys[j].selected = false;
				}
			}	
		}
					
		let indexArr1 = this.readIndex(this.selectedList,v);
		this.selectedList.splice(indexArr1[0],1);
		
	}
	// 删除单个城市  
	private deleteCitys(v,v1){
		let indexArr = this.readIndex(this.regions,v,v1);
		let indexArr1 = this.readIndex(this.selectedList,v,v1);
		this.selectedList[indexArr1[0]].selected = false;
		if(indexArr[2]){
			this.regions[indexArr[0]].selected = false;
		}		
		this.selectedList[indexArr1[0]].citys.splice(indexArr1[1],1);
		if(indexArr[3]){
			this.regions[indexArr[0]].citys[indexArr[1]].selected = false;
		}	
		if(this.selectedList[indexArr1[0]].citys.length === 0){
			this.selectedList.splice(indexArr1[0],1);						
		}
	}
	
	// 清空选项
	private clearRegion(){
		for(let i=0,len=this.regions.length;i<len;i++){
			this.regions[i].selected = false;
			if(this.regions[i].citys){
				for(let j=0;j<this.regions[i].citys.length;j++){
					this.regions[i].citys[j].selected = false;
				}
			}
		}
		this.selectedList = [];
	}
	// 选择单个后判断是否全选
	private selectOne(list,v){
		let allCheck = false;
		let total;
		let count = 0;
		for(let i = 0;i < this.regionsCache.length;i++){
			if(v.id === this.regionsCache[i].id){
				total = this.regionsCache[i].citys.length;
			}
		}
		for(let i=0;i<list.length;i++){
			if(list[i].checked){
				count++;
			}
		}
		if(count === total){
			allCheck = true;
		}
		let index = this.regions.indexOf(v);
		this.regions[index].checked = allCheck;
	}

	// 确定并提交

	public submit() {
		let arr = [];
		for(let i=0,len=this.selectedList.length;i<len;i++){
			if(this.selectedList[i].selected){
				arr.push({
					id: this.selectedList[i].id,
					name: this.selectedList[i].name
				})
			}else{
				for(let j=0;j<this.selectedList[i].citys.length;j++){
					arr.push({
						id: this.selectedList[i].citys[j].id,
						name: this.selectedList[i].citys[j].name
					})
				}
			}
		}
		this.selectedList = [];
		this.regionData = [];
		this.searchInput.nativeElement.value = "";
		this._$result.next(arr);
	}
	// 取消
	public cancel(){
		this.selectedList = [];
		this.regionData = [];
		this.searchInput.nativeElement.value = "";
	}

	// 搜索
	private search(){
		let str = this.searchInput.nativeElement.value;
		this.regions = [];
		let choiced = [];
		// 右侧数组中提取已选标记
		for(let i = 0;i < this.selectedList.length;i++){
			if(this.selectedList[i].selected){
				choiced.push(this.selectedList[i].id);
			}else{
				for(let j = 0;j < this.selectedList[i].citys.length;j++){
					choiced.push(this.selectedList[i].citys[j].id);
				}
			}
		}
		// 搜索后左侧数组改变重新添加已选标记
		let addTab = (arr) => {
			let list = this.clone(arr);
			for(let i = 0;i < list.length;i++){
				if(choiced.indexOf(list[i].id) != -1){
					list[i].selected = true;
					if(list[i].citys){
						for(let j = 0;j < list[i].citys.length;j++){
							list[i].citys[j].selected = true;
						}
					}
				}else{
					if(list[i].citys){
						for(let j = 0;j < list[i].citys.length;j++){
							if(choiced.indexOf(list[i].citys[j].id) != -1){
								list[i].citys[j].selected = true;
							}
						}
					}
				}
			}
			return list;
		}
		str = str.replace(/\s+/g, "");
		if(!str){
			this.regions = this.clone(this.regionsCache);
			this.regions = addTab(this.regions);
			return;
		}
		for(let i=0;i<this.regionsCache.length;i++){
			let obj = this.clone(this.regionsCache[i]);
			if(obj.name.indexOf(str) != -1){			
				this.regions.push(obj)
				if(obj.citys){
					for(let j=0;j<obj.citys.length;j++){
						if(obj.citys[j].name.indexOf(str) != -1){
							this.regions[this.regions.length-1].show = true;
						}
					}
				}
			}else{
				if(obj.citys){
					let isExist = false;
					let arr = [];
					for(let j=0;j<obj.citys.length;j++){
						if(obj.citys[j].name.indexOf(str) != -1){
							isExist = true;
							arr.push(obj.citys[j]);
						}
					}
					if(isExist){
						this.regions.push(obj);
						this.regions[this.regions.length-1].show = true;
						this.regions[this.regions.length-1].citys = arr;
					}
				}
			}
		}
		this.regions = addTab(this.regions);
	}

	// 确定按钮搜索功能
	private addEvent(){
		let that = this;
		document.documentElement.onkeypress = (e) => {		
			if(e.keyCode === 13){
				that.search();
			}	
	    }
	}
	private removeEvent(){
		document.documentElement.onkeypress = null;
	}


	// 克隆对象
	private clone(obj){
		return JSON.parse(JSON.stringify(obj));
	}
	// 位置读取器
	private readIndex(arr,v,v1?){
		let index = [];
		index[2] = false;
		index[3] = false;
		for(let i = 0;i < arr.length;i++){
			if(arr[i].id === v.id){
				index[0] = i;
				index[2] = true;
				if(v1){
					for(let j = 0;j < arr[i].citys.length;j++){
						if(arr[i].citys[j].id === v1.id){
							index[1] = j;
							index[3] = true;
							break;
						}
					}
				}
				break;
			}
		}
		return index;
	}
	
	
}