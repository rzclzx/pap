import { Component,OnInit,ViewChild,TemplateRef,ElementRef } from "@angular/core";
import { Router,ActivatedRoute,Params } from "@angular/router";
import { Page } from "../../models/page.model";

import { Project,EffectField,Rule,Staticval,RuleDetail,Formula,StaticvalDetail,RuleGroup } from "../../models/project.model";

import { ValidationService } from "../../services/validation.service";

import { ProjectService } from "../../services/project.service";
import { MyModalService } from "../../services/myModal.service";
import { ChineseService } from "../../services/chinese.service";

import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
declare var $;

@Component({
	selector: "project-mark",
	templateUrl: "./dist/client/views/project/projectMark.html"
})
export class ProjectMarkComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private validationService: ValidationService,
        private myModalService: MyModalService,
        private chineseService: ChineseService
    ){}

    ngOnInit(){
        this.dataInit();
        this.route.params.subscribe((params:Params) => {
			this.activeType = params["type"];
            this.ruleGroupId = params["ruleGroupid"];
            // 页码归零
            this.page = {
                pageNo: 0,
                pageSize: 10,
                total: 0
            };
            this.refreshTable();
		});
    }

    /**
     * 转化值页面
     */
    
    private activeType: string;

    private activeArr: Array<string>;

    private project: Project = new Project;

    private projectId: string;

    private effectNameArr: Array<boolean> = [];

    private staticNameArr: Array<boolean> = [];

    private staticValueArr: Array<boolean> = [];

    private isOpen: boolean = false;

    private typeToChinese = {
        "staticval": this.chineseService.config.STATIC,
        "ruleDetail": this.chineseService.config.RULE,
        "rule": this.chineseService.config.RULE_GROUP
    }
    // 按钮样式
    private addBtnstyle(e){
        $(".btn-default").removeClass("btn-choice");
        $(e.target).addClass("btn-choice");
    }
    // 数据初始化
    private dataInit(): void{
        this.projectId = this.route.snapshot.params["id"];
        this.activeArr = ["staticval","effect","rule","ruleDetail"];
    }
    // 刷新后数据重置
    private refreshDateinit(){
        
        // 选择归零
        this.selected = [];
		this.allCheck = false;
        this.effectFields = [];
        // 转化值在规则页面重置
        for(let i=0;i<this.project.effectFields.length;i++){
            if(this.project.effectFields[i].enable === "01"){
                this.effectFields.push(this.project.effectFields[i]);
            }
        }
        
        // 页码如果尾页删除后为零，页标自动跳到上级
        if(this.activeType == this.activeArr[0]){
            this.page.total = this.project.staticvals.length;
            if(!this.project.staticvals[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
                this.page.pageNo--;
            }
        }
        if(this.activeType == this.activeArr[2]){
            this.listrulegroups();
        }
        if(this.activeType == this.activeArr[3]){
            this.projectService.getRulegroup(this.ruleGroupId).subscribe(
                result => {
                    this.ruleGroup = result.body;
                    this.page.total = this.ruleGroup.rules.length;
                    if(!this.ruleGroup.rules[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
                        this.page.pageNo--;
                    }
                },
                error => {
                    this.myModalService.alert(error.message);
                }
            )
        }
    }
    // 刷新表格
    private refreshTable(){
        this.projectService.get(this.projectId).subscribe(
            result => {
                if(result.head.httpCode === 200){
                    this.project = this.clone(result.body);
                    this.refreshDateinit();
                }else{
                    this.myModalService.alert(result.body.message);
                }
            },
            error => error
        )     
    }


    /**
	 * 页码功能
	 */

    @ViewChild("datatable") datatable;

	private selected = [];
	private allCheck:boolean = false;

	private page:Page = {
        pageNo: 0,
        pageSize: 10,
        total: 0
    };
    onPage(event){
        this.page.pageNo = event.offset;
        this.allCheck = false;
        this.selected = [];
	}

	onSelect(event,page){
		if(!event.selected)
			return;
		this.allCheck = event.selected.length == ((page.pageNo+1)*page.pageSize > page.total ? page.total % page.pageSize : page.pageSize) ? true : false;
	}
    
	private update(e): void{
		this.page.pageSize = e;
        this.page.pageNo = 0;
		this.refreshTable();
	}
	
	private allToggleOuter(value){
		this.allCheck = value;	
        let obj = {
            "staticval": this.project.staticvals,
            "rule": this.ruleGroups,
            "ruleDetail": this.ruleGroup.rules
        }
        this.allToggle(this.datatable,value,obj[this.activeType]);
	}

	
	private outerDelete(e): void{
		this.delete(this.selected);
	}

	private allToggle(table,allcheck,data){
		table.selected.splice(0,table.selected.length);
		if(allcheck){
			let start = table.offset*table.pageSize,
				end = (table.offset+1)*table.pageSize > table.rowCount ? table.rowCount : (table.offset+1)*table.pageSize;
			for(let i=start;i<end;i++){
				table.selected.push(data[i])
			}
		}
	}

	private delete(selected) {
		if (selected.length == 0) {
			this.myModalService.alert(this.chineseService.config.NOT_CHOICE);
		} else {
			let ids = [];
			let deleteStr='';
			for(let i=0;i<selected.length;i++){
				ids.push(selected[i].id);	
			}
			deleteStr = ids.join(",");
			let subject;
			if(ids.length == 1){
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_DELETE + this.typeToChinese[this.activeType] + ' ' + selected[0].name + ' ' +this.chineseService.config.WHAT);
			}else{
				subject =  this.myModalService.confirm(this.chineseService.config.CONFIRM_BATCH_DELETE + this.typeToChinese[this.activeType] + this.chineseService.config.WHAT);
			}
            subject.subscribe({
                next: (data) => {
                    if(data){
                        this.projectService["delete" + this.activeType](deleteStr)
                        .subscribe(
                            result => {
                                if (result.head.httpCode == 204) {
                                    this.myModalService.alert(this.chineseService.config.SUCCESS);
                                    this.refreshTable();
                                } else {
                                    this.myModalService.alert(result.body.message);
                                }

                            },
                            error => {
                            this.myModalService.alert(error.message);
                        });
                    }
                    
                }
            })

		}
	}

    // 列表笔修改功能
	private switchWrite(type,row): void{
		if(!this[type + "Arr"][row.$$index]){
			this[type + "Arr"][row.$$index] = true;
		}
	}
	private switchUnWrite(type,row,e): void{
        this.changeName(type,row,e)     	
	}
    private changeName(type,row,e){
        let value = e.target.value;
        if(type.indexOf("Value") !== -1){
            let validateValue = value.replace(/-/,"");
            if(!/^(\-|\+)?\d+(\.\d+)?$/.test(value)){
                this.myModalService.alert(this.chineseService.config.NUMBER_OR_FLOAT);
                this[type + "Arr"][row.$$index] = false;
                return;
            }
            if(validateValue.indexOf(".") !== -1){
				let newVal = validateValue.split(".");
				if(newVal[0].length > 8){
                    this.myModalService.alert(this.chineseService.config.STATIC_INT_MOST_EIGHT);
                    this[type + "Arr"][row.$$index] = false;
					return;
				}else if(newVal[1].length > 4){
                    this.myModalService.alert(this.chineseService.config.STATIC_FLOAT_MOST_FOUR);
                    this[type + "Arr"][row.$$index] = false;
					return;
				}
			}else{
                if(validateValue.length > 8){
                    this.myModalService.alert(this.chineseService.config.STATIC_INT_MOST_EIGHT);
                    this[type + "Arr"][row.$$index] = false;
                    return;
                }			
			}
        }else{
            if(!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)){
                this.myModalService.alert(this.chineseService.config.UNDERLINE_NAME);
                this[type + "Arr"][row.$$index] = false;
                return;
            }
            if(value.length > 100){
                this.myModalService.alert(this.chineseService.config.EXTEND_ONE_HUNDRED);
                this[type + "Arr"][row.$$index] = false;
                return;
            }
        }     
        this.projectService[type](row.id,value)
            .subscribe(
            result => {
                if (result.head.httpCode == 204) {
                    this.refreshTable();
                }else{
                    this.myModalService.alert(result.body.message)
                }
                this[type + "Arr"][row.$$index] = false;
            },
            error => {
                    this[type + "Arr"][row.$$index] = false;
                    this.myModalService.alert(error.message);
                }
            )
        
    }
    //开关切换
	private switch(e,row){
		e.preventDefault();
		let value = e.target.checked;
		if(value){
			this.changeStatus(row.id,"01");
		}else{
			this.changeStatus(row.id,"02");
		}
	}
	// 改变状态
	private changeStatus(id,enable){
		this.projectService.enable(id,{enable:enable}).subscribe(
			result => {
				if (result.head.httpCode == 204){
					this.refreshTable();
				}else{				
					this.refreshTable();
					this.myModalService.alert(result.body.message)
				}
					
			},
			error => {
                this.myModalService.alert(error.message)
            }
        )
	}
    // 按钮切换
    private changeActiveId(activeType,row?){
        this.router.navigate(["/home/project/mark",this.projectId,activeType]);
        if(row){
            this.router.navigate(["/home/project/mark",this.projectId,activeType,row.id]);
        }
    }

    /**
     * 规则页面
     */
    
    @ViewChild("ruleGroupsmodal") ruleGroupsmodal: ModalComponent;
    private staticSigns = [
        {
            id: "B1",
            name: this.chineseService.config.IMPRESSIONAMOUNT
        },
        {
            id: "B2",
            name: this.chineseService.config.CLICKAMOUNT
        },
        {
            id: "B3",
            name: this.chineseService.config.JUMP
        },
        {
            id: "B4",
            name: this.chineseService.config.TOTALCOST
        },
        {
            id: "B5",
            name: this.chineseService.config.ADXCOST
        }  
    ];
    
    private relations: Array<string> = [">","<","=",">=","<=","!="];
    
    private ruleDetail: RuleDetail = new RuleDetail();
     
    private effectFields: Array<EffectField> = [];

    private ruleGroups: Array<RuleGroup> = [];

    private ruleGroup: RuleGroup = new RuleGroup();

    private isEditrule: boolean;

    private ruleGroupId: string;
  
    private clearBlank(str){
        return str.replace(/\s+/g, "");
    }
   
    private filterRule(){
        if(this.ruleDetail.triggerCondition){
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.effectFields,"code","name",false,false);
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.staticSigns,"id","name",false,false);
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.project.staticvals,"id","name",true,false);
            this.ruleDetail.triggerCondition = this.clearBlank(this.ruleDetail.triggerCondition);
        }
        for(let i=0;i<this.ruleDetail.formulas.length;i++){
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.effectFields,"code","name",false,false);
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.staticSigns,"id","name",false,false);
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.project.staticvals,"id","name",true,false);
            this.ruleDetail.formulas[i].formula = this.clearBlank(this.ruleDetail.formulas[i].formula);
        }
        
    }
    
    private filterString(){
        if(this.ruleDetail.triggerCondition){
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.effectFields,"name","code",false,true);
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.staticSigns,"name","id",false,true);
            this.ruleDetail.triggerCondition = this.filter(this.ruleDetail.triggerCondition,this.project.staticvals,"name","id",false,true);
            this.ruleDetail.triggerCondition = this.removeBracket(this.ruleDetail.triggerCondition);
        }     
        for(let i=0;i<this.ruleDetail.formulas.length;i++){
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.effectFields,"name","code",false,true);
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.staticSigns,"name","id",false,true);
            this.ruleDetail.formulas[i].formula = this.filter(this.ruleDetail.formulas[i].formula,this.project.staticvals,"name","id",false,true);
            this.ruleDetail.formulas[i].formula = this.removeBracket(this.ruleDetail.formulas[i].formula);
        }
    }
   
    private removeBracket(str){
        return str.replace(/\{|\}/g,"");
    }
    
    private filter(str,arr,reId,reName,addBracket,addBlank){
        str = str || "";
        arr = arr || [];
        reId = reId || "";
        reName = reName || "";
        for(let i=0;i<arr.length;i++){
            let regStr = addBlank ? arr[i][reName] : " " + arr[i][reName] + " ";
            let reg = new RegExp(regStr,"g");
            let value = arr[i][reId];
            value = addBracket ? "{" + value + "}" : value;
            value = addBlank ? " " + value + " " : value;
            str = str.replace(reg,value);
        }
        return str;
    }
   
    
    private openInit(){
        this.isOpen = true;
    }
    private refreshClose(){
        this.isOpen = false;
        $(".btn-default").removeClass("btn-choice");
        $(".err-tip-span").remove();
    }
    private listrulegroups(){
        this.projectService.listRuleGroups({projectId: this.projectId}).subscribe(
            result => {
                this.ruleGroups = result.body.items;
                this.page.total = this.ruleGroups.length;
                if(!this.ruleGroups[this.page.pageSize*this.page.pageNo] && this.page.pageNo > 0){
                    this.page.pageNo--;
                }
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
    }
    private ruleGroupsCancel(){
        this.ruleGroupsmodal.close();
        this.refreshClose();  
    }
    private ruleGroupsConfirm(){
        if(this.validationService.validate()){
            if(this.isEditrule){
                this.projectService.updateRulegroup(this.ruleGroup.id,{id: this.ruleGroup.id,name: this.ruleGroup.name}).subscribe(
                    result => {
                        this.refreshTable();
                        this.ruleGroupsmodal.close();
                        this.refreshClose(); 
                    },
                    error => {
                        this.myModalService.alert(error.message);
                    }
                )
            }else{
                this.projectService.createRulegroup({projectId: this.projectId,name: this.ruleGroup.name}).subscribe(
                    result => {              
                        this.refreshTable();
                        this.ruleGroupsmodal.close();
                        this.refreshClose();                  
                    },
                    error => {
                        this.myModalService.alert(error.message);
                    }
                )
            }
            
        }else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
        
    }
    private addGroups(){
        this.isEditrule = false;
        this.openInit();
        this.ruleGroup = new RuleGroup();
        this.ruleGroupsmodal.open();
    }
    private editGroups(row){
        this.isEditrule = true;
        this.openInit();
        this.ruleGroup = this.clone(row);
        this.ruleGroupsmodal.open();
    }



    /**
     * 静态值页面
     */

    
    @ViewChild("staticAdd") staticAdd: ModalComponent;

    private staticvalDetail: StaticvalDetail = new StaticvalDetail();

    private goAddStatic(){
        this.staticvalDetail = new StaticvalDetail();
        this.openInit(); 
        this.staticAdd.open();
    }
    private staticCancel(){
        this.staticAdd.close();
        this.refreshClose();  
    }
    private staticConfirm(){
        this.staticvalDetail.projectId = this.projectId;
        if(this.validationService.validate()){
            this.projectService.createStatic(this.staticvalDetail).subscribe(
                result => {
                    if(result.head.httpCode === 201){
                        this.refreshTable();
                        this.staticAdd.close();
                        this.refreshClose();  
                    }else{
                        this.myModalService.alert(result.body.message);
                    }
                },
                error => {
                    this.myModalService.alert(error.message);
                }
            )
        }else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
        
    }

    /**
     * 公共方法
     */
    private clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }
    private toListTime(value){
        let date = new Date(value);
		let month = this.oneOrTwo(date.getMonth() + 1);
        let day = this.oneOrTwo(date.getDate());
        let hour = this.oneOrTwo(date.getHours());
        let minute = this.oneOrTwo(date.getMinutes());
        let second = this.oneOrTwo(date.getSeconds());
        return date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }
    private oneOrTwo(value){
        let str;
        value = value.toString();
        str = value.length === 1 ? "0" + value : value;
        return str;
    }
	private cutLongstring(name: string): string{
        if(!name){
            return  "";
        }
		let str;
		if(name.length > 13){
			str = name.slice(0,20)+"...";
		}else{
			str = name;
		}
		return str;
	}

}
