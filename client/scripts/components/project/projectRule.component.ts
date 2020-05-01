import { Component,OnInit,ViewChild,TemplateRef,ElementRef } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";

import { Project,EffectField,Rule,Staticval,RuleDetail,Formula,StaticvalDetail,RuleGroup } from "../../models/project.model";

import { ProjectService } from "../../services/project.service";
import { MyModalService } from "../../services/myModal.service";
import { ValidationService } from "../../services/validation.service";
import { ChineseService } from "../../services/chinese.service";
import "../../../resource/request.js";
declare var profiles;
declare var $;

@Component({
	selector: "project-rule",
	templateUrl: "./dist/client/views/project/projectRule.html"
})

export class ProjectRuleComponent implements OnInit {

    private project: Project = new Project();

    private projectId: string;

    private id: string;

    // 定义关系数组
    private relations: Array<string> = [">","<","=",">=","<=","!="];
    // 创建rule对象
    private ruleDetail: RuleDetail = new RuleDetail();
    // 定义公式可以写入计数数组
    private isRulewrite = [];
    // 定义过滤转化值存储数组
    private effectFields: Array<EffectField> = [];
    
    private isEdit: boolean;

    private isWriteCondition: boolean = false;

    private ruleGroupId: string;

    private ruleGroup: RuleGroup = new RuleGroup();

    private showList: boolean = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private myModalService: MyModalService,
        private projectService: ProjectService,
        private validationService: ValidationService,
        private chineseService: ChineseService
    ){}

    ngOnInit(){
        this.routeInit();
        this.dateInit();
    }

    // 路由初始化
    private routeInit(){
        this.projectId = this.route.snapshot.params["projectId"];
        this.ruleGroupId = this.route.snapshot.params["ruleGroupid"];
        if(this.route.snapshot.params["id"]){
            this.isEdit = true;
            this.id = this.route.snapshot.params["id"];
        }else{
            this.isEdit = false;
        }
    }
    // 数据初始化

    private dateInit(){
        this.projectService.get(this.projectId).subscribe(
            result => {
                if(result.head.httpCode === 200){
                    this.project = this.clone(result.body);
                    for(let i=0;i<this.project.effectFields.length;i++){
                        if(this.project.effectFields[i].enable === "01"){
                            this.effectFields.push(this.project.effectFields[i]);
                        }
                    }
                    if(this.isEdit){
                        this.editInit();
                    }else{
                        this.addInit();
                    }
                }else{
                    this.myModalService.alert(result.body.message);
                }
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
        this.projectService.getRulegroup(this.ruleGroupId).subscribe(
            result => {
                this.ruleGroup = result.body;
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )
    }
    
    private signs = [
        {
            id:"01",
            name:"("
        },
        {
            id:"02",
            name:")"
        },
        {
            id:"03",
            name:"+"
        },
        {
            id:"04",
            name:"-"
        },
        {
            id:"05",
            name:"*"
        },
        {
            id:"06",
            name:"/"
        }
    ];

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
    // 按钮样式
    private addBtnstyle(e){
        $(".btn-default").removeClass("btn-choice");
        $(e.target).addClass("btn-choice");
    }
    
    // 新建初始化
    private addInit(){
        this.ruleDetail = new RuleDetail();   
        this.ruleDetail.groupId = this.ruleGroupId;   
    }
    // 编辑初始化
    private editInit(){
        this.goEditRule();
        
    }
    // 新建条件
    private addCondition(){
        this.ruleDetail.triggerCondition = "";
        this.ruleDetail.relation = this.relations[0];
        this.ruleDetail.staticval.id = this.project.staticvals[0] ? this.project.staticvals[0].id : undefined;
        this.ruleDetail.staticvalId = this.project.staticvals[0] ? this.project.staticvals[0].id : undefined;
    }
    // 删除条件
    private deleteCondition(){
        delete this.ruleDetail.triggerCondition;
        delete this.ruleDetail.relation;
        delete this.ruleDetail.staticvalId;
    }
    // 清除条件公式
    private clearCondition(e){
        e.stopPropagation();
        this.ruleDetail.triggerCondition = "";
    }
    // 条件公式写入
    private conditionWrite(e,row){
        e.stopPropagation();
        if(this.ruleDetail.triggerCondition === undefined){
            return;
        }
        this.ruleDetail.triggerCondition += " " + row.name + " ";
    }
    // 添加公式
    private addFormula(){
        this.ruleDetail.formulas.push(new Formula());
        this.ruleDetail.formulas[this.ruleDetail.formulas.length-1].staticvalId = this.project.staticvals[0] ? this.project.staticvals[0].id : undefined;
        this.isRulewrite.push(false);
    }
    // 删除公式
    private deleteFormula(i){
        this.ruleDetail.formulas.splice(i,1);
        this.showList = false;
        let that = this;
        setTimeout(function(){
            that.showList = true;
        },1);
    }
    // 点击获取写入焦点
    private isWrite(e,index){
        e.stopPropagation();
        this.isWriteCondition = false;
        for(let i=0;i<this.isRulewrite.length;i++){
            this.isRulewrite[i] = false;
        }
        if(index !== undefined){
            this.isRulewrite[index] = true;
        }else{
            this.isWriteCondition = true;
        }
        
    }
    // 失去写入焦点
    private clearWrite(){
        this.isWriteCondition = false;
        for(let i=0;i<this.isRulewrite.length;i++){
            this.isRulewrite[i] = false;
        }
    }
    // 公式组每条公式写入
    private ruleWrite(e,row){
        e.stopPropagation();
        let index;
        let iswrite;
        for(let i=0;i<this.isRulewrite.length;i++){
            if(this.isRulewrite[i]){
                index = i;
                iswrite = true;
            }
        }
        if(iswrite){
            this.ruleDetail.formulas[index].formula = this.ruleDetail.formulas[index].formula ? this.ruleDetail.formulas[index].formula : "";
            this.ruleDetail.formulas[index].formula += " " + row.name + " ";
        }  
    }
    // 清除公式组公式
    private clearFormula(e,index){
        e.stopPropagation();
        this.ruleDetail.formulas[index].formula = "";
    }
    // 去空格
    private clearBlank(str){
        return str.replace(/\s+/g, "");
    }
    // 显示过滤成请求参数
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
    // 请求参数过滤成显示
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
    // 去大括号
    private removeBracket(str){
        return str.replace(/\{|\}/g,"");
    }
    // 数组对象过滤转化
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
    // modal
    // 编辑
    private goEditRule(){
        this.projectService.getRule(this.id).subscribe(
            result => {
                if(result.head.httpCode === 200){
                    this.ruleDetail = new RuleDetail();
                    this.ruleDetail = Object.assign(this.ruleDetail, result.body);
                    if(this.ruleDetail.staticval.id){
                        this.ruleDetail.staticvalId = this.ruleDetail.staticval.id;
                    }          
                    for(let i = 0;i < this.ruleDetail.formulas.length;i++){
                        this.ruleDetail.formulas[i].staticvalId = this.ruleDetail.formulas[i].staticval.id;
                    }
                    this.filterString();
                }else{
                    this.myModalService.alert(result.body.message);
                }
            },
            error => {
                this.myModalService.alert(error.message);
            }
        )  
    }

    
    
    // 权重和为1
    private validateWeight(){
        let count = 0;
        let validate;
        let arr = [];
        let lengths = [];
        for(let i = 0;i < this.ruleDetail.formulas.length;i++){
            arr.push(this.ruleDetail.formulas[i].weight);
            lengths.push(this.getFloatLength(this.ruleDetail.formulas[i].weight.toString()));
        }
        
        let num = Math.pow(10,Math.max(...lengths));
        for(let i = 0;i < arr.length;i++){
            count += arr[i]*num;
        }
        validate = count/num == 1 ? true : false;
        return validate;
    }
    private getFloatLength(str){
        let arr = str.split(".");
        return arr.length === 2 ? arr[1].length : 0;
    }
    // 公式不能为空
    private validateFormula(){
        if(this.ruleDetail.triggerCondition !== undefined && this.ruleDetail.triggerCondition === ""){
            return 1;
        }
        if(this.ruleDetail.formulas.length === 0){
            return 0;
        }
        let formulas = this.ruleDetail.formulas;
        for(let i = 0;i < formulas.length;i++){
            if(!formulas[i].formula){
                return 2;
            }
        }
    }
    // 确定
    private ruleConfirm(){
        if(this.validationService.validate()){        
            if(this.validateFormula() === 0){
                this.myModalService.alert(this.chineseService.config.PLEASE_CREATE_RULE);
                return;
            }
            if(this.validateFormula() === 1){
                this.myModalService.alert(this.chineseService.config.CONDITION_RULE_ISNOT_EMPTY);
                return;
            }else if(this.validateFormula() === 2){
                this.myModalService.alert(this.chineseService.config.RULE_RULE_ISNOT_EMPTY);
                return;
            }
            if(!this.validateWeight()){
                this.myModalService.alert(this.chineseService.config.WEIGHT_SUM_MUST_ONE);
                return;
            }
            this.filterRule();
            if(this.isEdit){
                this.projectService.updateRule(this.ruleDetail.id,this.ruleDetail).subscribe(
                    result => {
                        if(result.head.httpCode === 204){
                            this.router.navigate(["/home/project/mark",this.projectId,"ruleDetail",this.ruleGroupId]);
                        }else{
                            this.myModalService.alert(result.body.message);
                        }
                    },
                    error => {
                        this.myModalService.alert(error.message);
                    }
                )
            }else{
                this.projectService.createRule(this.ruleDetail).subscribe(
                    result => {
                        if(result.head.httpCode === 201){
                              this.router.navigate(["/home/project/mark",this.projectId,"ruleDetail",this.ruleGroupId]);
                        }else{
                            this.myModalService.alert(result.body.message);
                        }
                    },
                    error => {
                        this.myModalService.alert(error.message);
                    }
                )
            }
            this.filterString();
        }else {
			this.myModalService.alert(this.chineseService.config.FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE);
		}
        
    }

    private clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

    private myStopPropagation(e){
        e.stopPropagation();
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