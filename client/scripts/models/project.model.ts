/**
 * Created by haoyu chen on 07-12-2016.
 * 导出项目类
 */

export class Project {
	id: string;
	name: string;
	totalBudget: number;
	advertiserId: string;
	advertiserName: string;
	industryId: string;
	industryName: string;
	// kpiId: string;
	kpiName: string;
	// kpiVal: number;
	status: string;
	impressionAmount: number;
	clickAmount: number;
	clickRate: number;
	clickCost: number;
	cost: number;
	totalCost: number;
	remark: string;
	transform: number;
	corpus: number;
	effectFields: Array<EffectField> = [new EffectField()];
	staticvals: Array<Staticval> = [new Staticval()];
	rules: Array<Rule> = [new Rule()];
	adxCost: string;
	code: string;
}

export class EffectField {
	id: string;
	name: string;
	code: string;
	enable: string;
}

export class Rule {
	id: string;
	name: string;
	updateTime: number;
	triggerCondition: string;
	relation: string;
	staticval: any = new ruleStaticval();
}
export class ruleStaticval{
	id: string;
	name: string;
	value: string;
}
export class Staticval {
	id: string;
	name: string;
	updateTime: number;
	value: number;
}
export class StaticvalDetail {
	projectId: string;
	name: string;
	value: number;
}

export class RuleDetail{
	id: string;
	groupId: string;
	name: string;
	triggerCondition?: string;
	relation?: string;
	staticvalId?: string;
	staticval?: any = new ruleStaticval();
	formulas: Array<Formula> = [];
}
export class Formula{
	name: string;
	formula: string;
	staticvalId: string;
	forwardVernier: number;
	staticval: any = new ruleStaticval();
	negativeVernier: number;
	weight: number;
}

export class RuleGroup {
	projectId: string;
	name: string;
	id: string;
	updateTime: number;
	rules: Array<Rule> = [new Rule()];
}
