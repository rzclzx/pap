/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";


@Injectable()

export class ChineseService {
    public config = {
        TIMERANGEPICKER_CONFIG: {
			applyLabel : "确定",
			cancelLabel : "取消",
			fromLabel : "起始时间",
			toLabel : "结束时间",
			customRangeLabel : "自定义",
			daysOfWeek : [ "日", "一", "二", "三", "四", "五", "六" ],
			monthNames : [ "一月", "二月", "三月", "四月", "五月", "六月",
					"七月", "八月", "九月", "十月", "十一月", "十二月" ],
			firstDay : 1
		},
        MENU_ARRAY: [
            {
                name: "广告管理",
                childs: [
                    {
                        name: "客户管理",
                        nav: "/home/advertiser"
                    },
                    {
                        name: "项目管理",
                        nav: "/home/project"
                    },
                    {
                        name: "落地页管理",
                        nav: "/home/landpage"
                    }
                ]
            },
            {
                name: "数据中心",
                childs: [
                    {
                        name: "流量数据",
                        nav: "/home/flowData"
                    },
                    {
                        name: "出价分析",
                        nav: "/home/bidAnalysis/adxAnalysis"
                    },
                    {
                        name: "受众分析",
                        nav: "/home/analysis"
                    },
                    {
                        name: "转化数据导入",
                        nav: "/home/import"
                    }
                ]
            },
            {
                name: "工具箱",
                childs: [
                    {
                        name: "人群管理",
                        nav: "/home/population"
                    }
                ]
            }
        ],
        WEEKS_ARRAY_ONE_SEVEN: ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"],
        REASON_OBJ: {
			"01": "项目总预算达到上限",
			"02": "活动日预算达到上限",
			"03": "展现数达到上限",
			"04": "不在定向时间段内",
			"05": "无可投放创意",
			"06": "监测码重复不能被使用"
		},
        APP_SEARCH_TYPE_OBJ: {
            "01": "精确",
            "02": "模糊"
        },
        MATERIAL: [
            {
                name: "图片",
                type: 2
            },
            {
                name: "视频",
                type: 6
            },
            {
                name: "信息流",
                type: 9
            }
        ],
        MATERIAL1: [
            {
                name: "图片",
                type: "01"
            },
            {
                name: "视频",
                type: "02"
            },
            {
                name: "信息流",
                type: "03"
            }
        ],
        ADVERTISER_ADX: [
            {
                name: "百度",
                value: false,
                id: "8"
            },
            {
                name: "陌陌",
                value: false,
                id: "24"
            },
            {
                name: "汽车之家",
                value: false,
                id: "23"
            },
            {
                name: "广点通",
                value: false,
                id: "21"
            },
            {
                name: "adview",
                value: false,
                id: "14"
            }
        ],
        IMAGE: "图片",
        VIDEO: "视频",
        INFOFLOW: "信息流",
        APP_SEARCH_NAME_VALIDATE: "只支持中文、大小写英文、横杠、下划线、数字，并且长度在100个字符以内",
        SYNC_SUCCESS: "同步成功",
        SYNC_FAIL: "同步失败",
        AUDIT_SUCCESS: "审核成功",
        FAIL_PLEASE_UPLOAD_BUSINESS_IMG: "提交失败，请上传营业执照图片",
        BRAND_NAME_AND_BRAND_LOGO_MUST_SYNC: "品牌名称和品牌logo必须同时填写",
        FAIL_PLEASE_PERFECT_SUBMIT_MESSAGE: "提交失败，请完善提交信息",
        SUBMIT_SUCCESS: "提交成功",
        USERNAME_ALREADY_EXIST: "用户名已存在",
        USER_ENTRANCE: "开户许可证",
        BUSINESS: "营业执照",
        BUSINESS_MUST_UPLOAD: "营业执照必须上传",
        NOT_CHOICE: "没选择",
        CONFIRM_DELETE: "确定删除",
        CONFIRM_BATCH_DELETE: "确定批量删除",
        ADVERTISER: "客户",
        PROJECT: "项目",
        CAMPAIGN: "活动",
        CREATIVE: "创意",
        LANDPAGE: "落地页",
        POPULATION: "人群",
        WHAT: "吗？",
        SUCCESS: "成功",
        IMPRESSIONAMOUNT: "展现数",
        CLICKAMOUNT: "点击数",
        CLICKRATE: "点击率",
        OPERATOR: "运营商",
        NETWORK: "网络",
        SYSTEM: "操作系统",
        MAX: "最大值",
        MIN: "最小值",
        PRICE: "价格",
        JUMP: "二跳",
        TOTALCOST: "成本",
        ADXCOST: "修正成本",
        PLEASE_CHOICE_CAMPAIGN_RANGE: "请先选择活动时间",
        ALSO_DELETE_LAST_MESSAGE: "只能删除最后一条",
        IF_ADDFREQUENCY_MUST_PERFECT_MESSAGE: "若添加频次控制，则必须完善频次控制信息",
        NOT_APP_PLEASE_GOTO_ADVERTISER: "无可用APP，请到客户管理页面设置",
        APP_AMOUNT_ISNOT_ZERO: "APP数量不能为0，请重新选择筛选条件",
        ATLEAST_CHOICE_ADSENSE: "至少选择一个广告位",
        ACTION: "投放中",
        NOT_ACTION: "未投放",
        FINISH: "已完成",
        PAUSE: "已暂停",
        PLEASE_CHOICE_COPY_PROJECT: "请选择要复制的项目",
        TIME_UPDATE_SUCCESS: "时间修改成功",
        PLEASE_CHOICE_ADX: "请选择ADX",
        FILTER_WORDS_EXIST: "筛选关键词已存在",
        REMOVE_WORDS_EXIST: "排除关键词已存在",
        DATA_FORMAT_ERROR_PLEASE_CHOICE_AGAIN: "数据格式有误，请重新选择时间段",
        IMAGE_SIZE: "图片尺寸",
        IMAGE_BIGORSMALL: "大小",
        IMAGE_TYPE: "图片类型",
        VIDEO_SIZE: "视频尺寸",
        VIDEO_FORMAT: "视频格式",
        EXIST_NOT_UPLOAD_IMAGE_PLEASE_UPLOAD: "存在未上传的图片位置，请上传图片",
        PLEASE_UPLOAD_IMAGE: "请上传图片",
        PLEASE_UPLOAD_VIDEO: "请上传视频",
        EDIT_FAIL: "编辑失败",
        UPLOAD_SUCCESS: "上传成功",
        UPLOAD_FAIL: "上传失败",
        UPLOAD_FAIL_PLEASE_NORMAL_FILE_FORMAT: "上传失败,请规范文件格式",
        INT_OR_TWO_FLOAT: "请输入整数或保留两位小数",
        PRICE_ISNOT_EXTEND_SIX_MEASURE: "价格最多不能超过6位",
        PLEASE_INPUT_FILTER_CONDITION: "请输入筛选条件",
        PLEASE_UPLOAD_FILE: "请上传文件",
        PLEASE_CHOICE_PROJECT: "请选择项目",
        ADD_SUCCESS: "添加成功",
        UPDATE_SUCCESS: "修改成功",
        CODE_INSTALL_SUCCESS: "代码安装成功",
        CODE_INSTALL_FAIL: "代码安装失败",
        PLEASE_CREATE_ADVERTISER: "请先创建广告主",
        ALSO_INPUT_PLUS_INT: "只能输入正整数",
        PRICE_ISNOT_EXTEND_EIGHT_NINE: "价格最多不能超过99999999",
        STATIC: "静态值",
        RULE: "规则",
        RULE_GROUP: "规则组",
        NUMBER_OR_FLOAT: "必须为数字或浮点数",
        STATIC_INT_MOST_EIGHT: "静态值整数部分最多8位",
        STATIC_FLOAT_MOST_FOUR: "静态值小数部分最多4位",
        UNDERLINE_NAME: "只支持中文、大小写英文、中英文下划线、数字",
        EXTEND_ONE_HUNDRED: "超过限制长度100个字符",
        PLEASE_CREATE_RULE: "请创建评估公式",
        CONDITION_RULE_ISNOT_EMPTY: "触发条件的公式不能为空",
        RULE_RULE_ISNOT_EMPTY: "评估公式的公式不能为空",
        WEIGHT_SUM_MUST_ONE: "权重之和必须等于1",
        USERNAME_NOT_EXIST: "用户名不存在",
        USERNAME_OR_PASSWORD_NOT_EXIST: "用户名或密码不存在",
        PASSWORD_ERROR: "密码错误",
        PLEASE_UPLOAD_QUALIFICATION: "请上传资质",
        ADX_ANALYSIS_OPTIONS: [
            {
                name: "请求数",
                value: "requestAmount",
                isExist: false
            },
            {
                name: "参与竞价数",
                value: "bidAmount",
                isExist: false
            },
            {
                name: "成交数",
                value: "winAmount",
                isExist: false
            },
            {
                name: "展现数",
                value: "impressionAmount",
                isExist: false
            },
            {
                name: "出价率",
                value: "bidRate",
                isExist: false
            },
            {
                name: "成交率",
                value: "winRate",
                isExist: false
            } 
        ]
    }
}