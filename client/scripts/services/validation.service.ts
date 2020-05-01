/**
 * Created by Haoyu Chen on 07-12-2016.
 */
import { Injectable } from "@angular/core";

declare var $;

@Injectable()
export class ValidationService {

	private validationConfigs:ValidationConfigs = new ValidationConfigs();

	/* 错误队列 */
	private errQueue:any[] = [];

	private validCache = {};

	private isInQueue(errObj): number{
		for(let i = 0,len = this.errQueue.length; i < len; i++){
			if(errObj.name == this.errQueue[i].name){
				return i;
			}
		}
		return -1;
	};
	private addQueue(errObj): void{
		if(this.isInQueue(errObj) === -1){
			this.errQueue.push(errObj);
		}
	};
	private removeQueue(errObj): void{
		let index = this.isInQueue(errObj);
		index !== -1 && this.errQueue.splice(index, 1);
	};
	private isEmptyQueue(): boolean{
		return this.errQueue.length == 0 ? true : false;
	};
	private typeOf(o): string{
		var _toString = Object.prototype.toString;
		var _type = {
			"undefined" : "undefined",
			"number" : "number",
			"boolen" : "boolen",
			"string" : "string",
			"[object Function]" : "function",
			"[object RegExp]" : "regexp",
			"[object Array]" : "array",
			"[object Date]" : "date",
			"[object Error]" : "error"
		}
		return _type[typeof o] || _type[_toString.call(o)] || (o ? "object" : "null");
	};
	private parseValid(str){
		let valids = str ? str.split(";") : [],
			ret = {};
		for (let i = 0,length = valids.length; i < length; i++) {
			let n = valids[i];
			if(n){
				if(n.indexOf(":")){
					var t = n.split(":");
					ret[t[0]] = t[1];
				}else{
					ret[n] = null;
				}
			}
		}
		return ret;
	};

	private addError(elm,name,validObj): boolean{
		let el = $(elm);
		this.addQueue({
			name : name,
			element : el
		});
		el.parent().find(".err-tip-span[data-name='"+name+"']").remove();
		el.parent().css("position","relative");
		try {
			el.parent().append("<span class=\"err-tip-span\" data-name=\""+name+"\">"+ validObj.alertText.replace("{validName}",this.validCache[name].validName?this.validCache[name].validName:"字段") +"</span>");
		} catch (error) {
			
		}
		
		el.addClass("err-tip");
		return false;
	};

	public removeError(elm,name){
		let el = $(elm);
		this.removeQueue({name : name});
		if(el.hasClass("err-tip")){
			el.removeClass("err-tip");
		}
		el.parent().find(".err-tip-span[data-name='"+name+"']").remove();
	};
	public removeErrorAll(){
		for(let v in this.validCache){
			this.removeError(this.validCache[v].el,this.validCache[v].el.name);
		}
	}

	public setValidateCache(event:string, elm, validations:string, validName:string){
		if(!elm.name){
			return;
		}

		if(this.validCache.hasOwnProperty(elm.name)){
			this.validCache[elm.name].value = event;
		}else{
			this.validCache[elm.name] = {
				value:event,
				el:elm,
				validations:validations,
				validName:validName
			}
		}
	}
	public setAll(){
		for(let v in this.validCache){
			this.setValidateCache(this.validCache[v].event,this.validCache[v].el,this.validCache[v].validations,this.validCache[v].validName);
		}
	}

	public clearQueue(){
		this.errQueue = [];
	}

	public removeValidateCache(name){
		delete this.validCache[name];
	}
	public removeValidateCacheAll(){
		this.validCache = {};
	}

	public validateOne(namestr:string,event) {
		
		let cacheObj = this.validCache[namestr];

		cacheObj.value = event;
		let val = cacheObj.value,
			valids = this.parseValid(cacheObj.validations),
			el = cacheObj.el,
			name = cacheObj.el.name;

		for(let i in valids){
			let validObj = this.validationConfigs[i],
				params = valids[i] || null;
			if(!validObj){
				new Error("未知验证规则");
			}
			if(validObj.func){
				if(!validObj.func(val ? val : "", params)){
					return this.addError(el,name,validObj);
				}else{
					this.removeError(el,name);
				}
			}else if(validObj.regx){
				if(this.typeOf(validObj.regx) !== "regexp"){
					if(this.typeOf(validObj.regx) === "string"){
						validObj.regx = new RegExp(validObj.regx.replace(/[\/|\\]/g, ""),"g");
					}else{
						new Error("不合法的正则表达式！");
					}
				}
				if(!validObj.regx.test(val)){
					return this.addError(el,name,validObj);
				}else{
					this.removeError(el,name);
				}
			}
		}
		return true;
	};

	//一次性验证所有需要验证的字段
	public validateAll(){
		for(let v in this.validCache){
			this.validateOne(v, this.validCache[v].value)
		}
	};


	//获取验证后的结果，验证通过返回`true`，否则返回`false`
	public validate(): boolean{
		this.validateAll();
		return this.isEmptyQueue() ? true : false;
	};
	public getQueue(){
		return this.errQueue;
	};
	public addRule(name, rule:ValidationConfig){
		if(!this.validationConfigs[name]){
			this.validationConfigs[name] = rule;
		}
	};
	public init(){
		this.errQueue = [];
	};
}

class ValidationConfigs{
	//姓名:最多10个字符，不限制
	name:ValidationConfig = {
		func: function(val, len){
			return val.length <= 10 ? true : false;
		},
		alertText:"姓名最多10个字符!"
	};
	//推广组名称:最多32个字符,支持中文、大小写英文、中英文横杠、数字
	groupnamename:ValidationConfig = {
		func:function(val){
			var reg = /^[-\w\u4e00-\u9fa5]+$/;
			if(val && val.length > 32){
				this.alertText = "最多32个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "支持中文、大小写英文、中英文横杠、数字！"
				return false;
			}else{
				return true;
			}
		}
	};
	//100字符，中文、大小写英文、中英文下划线、数字
	ruleName:ValidationConfig = {
		func:function(val){
			var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
			if(val && val.length > 100){
				this.alertText = "最多100个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "支持中文、大小写英文、中英文下划线、数字！"
				return false;
			}else{
				return true;
			}
		}
	};
	//账号:20个字符以内,无限制字符
	account:ValidationConfig = {
		func:function(val, len){
			return val.length <= 10 ? true : false;
		},
		alertText : "账号20个字符以内!"
	};
	//用户名:字母、数字、下划线、20个字符以内
	username:ValidationConfig = {
		func:function(val){
			var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
			if(val && val.length > 32){
				this.alertText = "最多32个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "仅支持中文、大小写英文、数字和下划线！"
				return false;
			}else{
				return true;
			}
		},
	};
	mobilephone:ValidationConfig = {
		func:function(val){
			var reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
			if(val && val.length > 11){
				this.alertText = "最多11个字符！";
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "联系电话为11位数字!"
				return false;
			}else{
				return true;
			}
			// return val.length <= 11 ? true : false;
		},
		// alertText:"手机号码的字符长度不能大于11！"
	};
	//电话和手机
	mobileandphone:ValidationConfig = {
		func:function(val){
			var reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
			var regPhone = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
			if(val && !reg.test(val) && !regPhone.test(val)){
				this.alertText = "手机或电话格式错误!"
				return false;
			}else if(val && (val.length > 13 || val.length < 10)){
				this.alertText = "手机或电话格式错误!";
				return false;
			}else{
				return true;
			}
			// return val.length <= 11 ? true : false;
		},
		// alertText:"手机号码的字符长度不能大于11！"
	};
	//密码:数字、字母组合，6-20个字符
	password:ValidationConfig = {
		regx: /^(?=.*?[a-zA-Z])[!#$%&"()*+,\-./:;<=>?@\[\\\]^_`{|}~A-Za-z0-9]{6,20}$/,
		alertText:"格式错误！密码必须由6-20个数字或字母组成！"
	};
	//公司名称:50个字符以内
	coname:ValidationConfig = {
		func : function(val, len){
			return val.length <= 50 ? true : false;
		},
		alertText : "公司名称字符长度不能大于50!"
	};
	//联系人:20字符
	concact:ValidationConfig = {
		func : function(val, len){
			return val.length <= 20 ? true : false;
		},
		alertText : "联系人字符长度不能大于20!"
	};
	//正负数字（包括小数）
	numberFloat:ValidationConfig = {
		regx: /^(\-|\+)?\d+(\.\d+)?$/,
		alertText:"必须为数字或浮点数！"
	};
	// 大于等于0的小数
	positiveFloat:ValidationConfig = {
		regx: /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/,
		alertText:"必须为大于0的小数！"
	};
	// double:ValidationConfig = {
	// 	regx: /[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?/,
	// 	alertText:"格式错误！密码必须由6-20个数字或字母组成！"
	// };
	//email:标准的邮箱格式，100个字符以内
	email:ValidationConfig = {
		// regx:/^@[].(com|cn)$/,
		// regx:/^\w+@[a-z0-9-]+(\.[a-z]{2,6}){1,2}$/,
		//regx:/^([a-zA-Z0-9]+([-_.]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9]+([-_.]?[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,6}$/,
		func:function(val){
			if(!val)
				return true;
		    var regx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
			return regx.test(val) ? true : false;
		},
		alertText:"常用邮箱的格式有误！"
	};

	//固定电话:固定电话格式，需要加区号，区号3-4位数字，号码7-8位数
	telephone:ValidationConfig = {
		func : function(val, len){
			return val.length <= 20 ? true : false;
		},
		alertText : "固定电话字符长度不能大于20!"
	};
	// 纯数字
	numberstr:ValidationConfig = {
		regx: /^[0-9]*$/,
		alertText:"必须为数字！"
	};
	//公司地址:100个字符以内
	address:ValidationConfig = {
		func : function(val, len){
			return val.length <= 100 ? true : false;
		},
		alertText : "公司名称字符长度必须在100个字符以内!"
	};
	//营业执照编号:100个字符以内
	businesscode:ValidationConfig = {
		func:function(val){
			var reg = /^[a-zA-Z0-9]+$/;
			if(val && val.length > 100){
				this.alertText = "最多100个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "仅支持大小写英文、数字！"
				return false;
			}else{
				return true;
			}
		},
		alertText : "营业执照编号长度必须在100个字符以内!"
	};
	//组织机构：100字符以内
	organizationcode:ValidationConfig = {
		func:function(val){
			var reg = /^[a-zA-Z0-9]+$/;
			if(val && val.length > 100){
				this.alertText = "最多100个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "仅支持大小写英文、数字！"
				return false;
			}else{
				return true;
			}
		},
		alertText : "组织机构长度必须在100个字符以内!"
	};
	//QQ号:20个字符以内
	qqcode:ValidationConfig = {
		func : function(val, len){
			return val.length <= 20 ? true : false;
		},
		alertText : "QQ号必须在20个字符以内!"
	};
	//邮编:6位数字的邮编格式
	postcode:ValidationConfig = {
		func : function(val, len){
			if(!val)
				return true;
			let regx = new RegExp(/^[1-9]*[1-9][0-9]*$/);
			return regx.test(val) ? (val.length == 6 ? true : false) : false;
		},
		alertText : "邮编格式必须为6位整数!"
	};
	//公司网址:Http\https开头，400个字符以内
	site:ValidationConfig = {
		/*regx:/^https?:\/\//,*/
		func:function(val,len){
			var reg = /^((https|http)?:\/\/)[^\s]+$/;
			//var reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/
			//var reg = /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/;
			if(val && !reg.test(val)){
				this.alertText = "请输入正确的url地址！";
				return false;
			}else{
				return true;
			}
		}
	};
	http:ValidationConfig = {
		func:function(val,len){
			var reg = /^((http)?:\/\/)[^\s]+$/;
			if(val && val.length>216){
				this.alertText = "最多216个字符!";
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "必须以http://开头";
				return false;
			}else{
				return true;
			}
		}
	};
	//组织机构代码:组织机构代码号须9位，可省略连字符
	agency:ValidationConfig = {
		regx:/^[0-9]{8}[\-]?[0-9]$/,
		alertText : "格式错误！组织机构代码号须9位，格式：xxxxxxxx-x（可省略连字符）!"
	};
	//销售:20个字符限制。不支持中文，特殊字符等字符
	sale:ValidationConfig = {
		regx:/^[a-zA-Z]{20}$/,
		alertText : "格式不正确!20个字符限制。不支持中文，特殊字符等字符!"
	};
	// 非汉字
	disChinese:ValidationConfig = {
		func:function(val,len){
			var reg = /[^\u0000-\u00FF]/;
			if(val && reg.test(val)){
				this.alertText = "不能输入中文和特殊字符";
				return false;
			}else{
				return true;
			}
		}
	};
	//类型标识:非负数
	typeflag:ValidationConfig = {
		//regx:/^[^0][0-9]{0,}$/,
		regx:/^[1-9]*[1-9][0-9]*$/,
		alertText : "必须为正整数"
	};
	//编号:正整数
	number:ValidationConfig = {
		//regx:/^[^0][0-9]{0,}$/,
		regx:/^[1-9]*[1-9][0-9]*$/,
		alertText : "必须为正整数"
	};
	selectNumber:ValidationConfig = {
		func : function(val,len){
			var reg = /^[1-9]*[1-9][0-9]*$/;
			if(val && !reg.test(val)){
				this.alertText = "必须为正整数!"
				return false;
			}else{
				return true;
			}
		}
	};
	//正浮点数
	plusFloat:ValidationConfig = {
		//regx:/^[^0][0-9]{0,}$/,
		regx:/^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/,
		alertText : "必须为正浮点数"
	};
	 
	//项目编号:最大长度32位，
	projectnumber:ValidationConfig = {
		func : function(val, len){
			var reg = /^[-0-9a-zA-Z]*$/;
			if(val && val.length > 14){
				this.alertText = "最多14个字符!"
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "只能由字母、中划线、数字组成!";
				return false;
			}else{
				return true;
			}
		},
	};
	//人民币汇率:正数,保留小数点后两位
	rate:ValidationConfig = {
		regx : /^([1-9]*[1-9][0-9]*(.[0-9]{0,2})?|0.[0-9]?[1-9]|0.[1-9][0-9]?)$/,
		alertText : "请输入正整数或保留两位小数！"
	};
	curreny:ValidationConfig = {
		regx : /^([1-9]*[1-9][0-9]*(.[0-9]{0,2})?|0.[0-9]?[1-9]|0.[1-9][0-9]?)$/,
		alertText : "请输入正整数或保留两位小数！"
	};
	
	maxclicknum:ValidationConfig = {
		func : function(val, len){
			var reg = /^[1,9]{1}[0,9]{0,9}$/;
			if(val && parseFloat(val) < 20000){
				this.alertText = "最小值为20000!";
				return false;
			}else if(val && !reg.test(val)){
				this.alertText = "最大为10位!";
				return false;
			}else{
				return true;
			}
		},
	};
	
	//金额:正数，保留小数点后两位
	//通用
	required :ValidationConfig = {
		func : function(val){
			return val ? true : false;
		},
		alertText : "{validName}不能为空！"
	};
	minlength:ValidationConfig = {
		func: function(val, len){
			val = val ? val : "";
			this.alertText = "{validName}字符长度不能小于"+len+"!";
			return val.length >= len ? true : false;
		}
	};
	maxlength: ValidationConfig = {
		func: function(val, len){
			val = val ? val : "";
			this.alertText = "字符长度不能大于"+len+"!";
			return val.length <= len ? true : false;
		}
	};
	// 静态值
	staticval: ValidationConfig = {
		func: function(val){
			val = val ? val : "";
			let validateValue = val.replace(/-/,"");		
			if(validateValue.indexOf(".") !== -1){
				let newVal = validateValue.split(".");
				if(newVal[0].length > 8){
					this.alertText = "静态值整数部分最多8位！";
					return false;
				}else if(newVal[1].length > 4){
					this.alertText = "静态值小数部分最多4位！";
					return false;
				}else{
					return true;
				}
			}else{
				this.alertText = "静态值整数部分最多8位！";
				return validateValue.length > 8 ? false : true;
			}
		}
	};

	maxnum:ValidationConfig = {
		func : function(val, num){
			if(val && parseFloat(val) > parseFloat(num)){
				this.alertText = "最大值为"+num+"!";
				return false;
			}else{
				return true;
			}
		},
	};
	minnum:ValidationConfig = {
		func : function(val, num){
			if(val && parseFloat(val) < parseFloat(num)){
				this.alertText = "最小值为"+num+"!";
				return false;
			}else{
				return true;
			}
		},
	};
}

class ValidationConfig {
	alertText?:string;
	func?:Function;
	regx?:RegExp;
}