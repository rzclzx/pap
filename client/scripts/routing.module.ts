import { NgModule } from "@angular/core";
import { RouterModule,Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";//表格插件
import { FileSelectDirective,FileUploadModule } from "ng2-file-upload"//文件上传插件
import { Daterangepicker } from "ng2-daterangepicker";//时间段选择插件
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";//弹框插件

//import * as echarts from "echarts";
//import * as moment from "moment";

import { WeekRangePickerModule } from "./modules/weekRangePicker.module";

/** 添加路由需四步 */

//1.添加工作区页面组件.ts文件

//2.导入工作区页面组件
import { AdvertiserListComponent } from "./components/advertiser/advertiserList.component";
import { AdvertiserFormComponent } from "./components/advertiser/advertiserForm.component";
import { AdvertiserAdxComponent } from "./components/advertiser/advertiserAdx.component";
import { ProjectListComponent } from "./components/project/projectList.component";
import { ProjectFormComponent } from "./components/project/projectForm.component";
import { CampaignListComponent } from "./components/campaign/campaignList.component";
import { CampaignFormComponent } from "./components/campaign/campaignForm.component";
import { FlowListComponent } from "./components/flowData/flowList.component";
import { CreativeUploadListComponent } from "./components/creative/creativeUploadList.component";
import { CreativeUploadFormComponent } from "./components/creative/creativeUploadForm.component";
import { LandpageFormComponent } from "./components/landpage/landpageForm.component";
import { LandpageListComponent } from "./components/landpage/landpageList.component";
import { ModalWeekRangeComponent } from "./components/campaign/modalWeekRange.component";
import { ModalRegionComponent } from "./components/campaign/modalRegion.component";
import { ModalAppComponent } from "./components/campaign/modalApp.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { populationListComponent } from "./components/toolBox/populationList.component";
import { ImportListComponent } from "./components/import/importList.component";
import { ImportFormComponent } from "./components/import/importForm.component";
import { ProjectMarkComponent } from "./components/project/projectMark.component";
import { PageFooterComponent } from "./components/public/pageFooter.component";
import { PopulationFormComponent } from "./components/toolBox/populationForm.component";
import { ProjectRuleComponent } from "./components/project/projectRule.component";
import { LoadingModalComponent } from "./components/public/loadingModal.component";
import { ProgressBarComponent } from "./components/public/progressBar.component";
import { AppSynchroComponent } from "./components/campaign/appSynchro.component";
import { MyModalComponent } from "./components/public/myModal.component";
import { NobidAnalysisComponent } from "./components/bidAnalysis/nobidAnalysis.component";
import { AdxAnalysisComponent } from "./components/bidAnalysis/adxAnalysis.component";
import { BidAnalysisComponent } from "./components/bidAnalysis/bidAnalysis.component";




import { ValidationDirective } from "./directives/validation.directive";
import { DaterangepickerDirective } from "./directives/daterangepicker.directive";
import { CutStringDirective } from "./directives/cutstring.directive";


import { ValidationService } from "./services/validation.service";
import { BaseService } from "./services/base.service";
import { AdvertiserService } from "./services/advertiser.service";
import { CampaignService } from "./services/campaign.service";
import { ProjectService } from "./services/project.service";
import { CodeService } from "./services/code.service";
import { CreativeService } from "./services/creative.service";
import { AppTmplService } from "./services/appTmpl.service";
import { LandpageService } from "./services/landpage.service";
import { IndustryService } from "./services/industry.service";
import { PopulationService } from "./services/population.service";
import { DataService } from "./services/data.service";
import { AppService } from "./services/app.service";
import { PublicService } from "./services/public.service";

import { CutStringService } from "./services/cutstring.service";
import { MyModalService } from "./services/myModal.service";
import { MaskService } from "./services/mask.service";
import { ChineseService } from "./services/chinese.service";
import { RootService } from "./services/root.service";

import { LaunchStatusPipe } from "./pipes/launchStatus.pipe";
import { advertiserStatusPipe } from "./pipes/advertiserStatus.pipe";
import { landpageStatusPipe } from "./pipes/landpageStatus.pipe";
import { imageFormatsPipe } from "./pipes/imageFormats.pipe";
import { videoFormatsPipe } from "./pipes/videoFormats.pipe";
import { creativeTypePipe } from "./pipes/creativeType.pipe";
import { creativeStatusPipe } from "./pipes/creativeStatus.pipe";
import { permillagePipe } from "./pipes/permillage.pipe";


export const childRoutes: Routes = [
	{ path: "" , redirectTo: "home/project", pathMatch: "full" },
	{ 
		path: "",
		children: [
			//3.添加工作区页面路由配置
			{ 
				path: "advertiser", 
				children: [ 
					{
						path: "advertiserForm",
						children: [
							{ path: "", component: AdvertiserFormComponent },
							{ path: ":id", component: AdvertiserFormComponent }
						]
					},
					{ path: "advertiserAdx/:id", component: AdvertiserAdxComponent },
					{ path: "", component: AdvertiserListComponent }
				]
			},
			{
				path: "project",
				children: [
					{ path: "projectAdd", component: ProjectFormComponent },
					{ path: "projectEdit/:id", component: ProjectFormComponent },
					{ path: "mark/:id/:type", component: ProjectMarkComponent },
					{ path: "mark/:id/:type/:ruleGroupid", component: ProjectMarkComponent },
					{ path: "rule/:projectId/:ruleGroupid", component: ProjectRuleComponent },
					{ path: "rule/:projectId/:ruleGroupid/:id", component: ProjectRuleComponent },
					{
						path: "campaign",
						children: [
							{ path: "add/:projectId", component: CampaignFormComponent },
							{ path: "add/:projectId/:isCopy", component: CampaignFormComponent },
							{ path: "edit/:campaignid", component: CampaignFormComponent },
							{ path: "list/:projectId", component: CampaignListComponent},
							{ path: "list/:projectId/:startDate/:endDate", component: CampaignListComponent}
						]
					},
					{ path: "creativeUploadList/:campaignid", component: CreativeUploadListComponent },
					{ path: "creativeUploadList/:campaignid/:startDate/:endDate", component: CreativeUploadListComponent },
					{ path: "creativeUploadAdd/:campaignid/:type", component: CreativeUploadFormComponent },
					{ path: "creativeUploadEdit/:campaignid/:type/:id", component: CreativeUploadFormComponent },
					{ path: "", component: ProjectListComponent },
					{ path: "**", redirectTo: "/home/project", pathMatch: "full" },
				]
			},
			{
				path: "landpage",
				children: [
					{
						path: "landpageForm",
						children: [
							{ path: "", component: LandpageFormComponent },
							{ path: ":id", component: LandpageFormComponent }
						]
					},
					{ path: "", component: LandpageListComponent }
				]
			},
			{ path: "flowData", component:FlowListComponent },
			{ path: "analysis", component:AnalysisComponent },
			{ 
				path: "bidAnalysis",
				children: [
					{ path: "nobidAnalysis", component: NobidAnalysisComponent},
					{ path: "bidAnalysis", component: BidAnalysisComponent},
					{ path: "adxAnalysis", component: AdxAnalysisComponent}
				] 
			},
			{ path: "app/synAppInfo", component:AppSynchroComponent },
			{ path: "analysis/:startDate/:endDate", component:AnalysisComponent },
			{ path: "analysis/:startDate/:endDate/:advertiserId", component:AnalysisComponent },
			{ path: "analysis/:startDate/:endDate/:advertiserId/:projectId", component:AnalysisComponent },
			{ path: "analysis/:startDate/:endDate/:advertiserId/:projectId/:campaignId", component:AnalysisComponent },
			{ 
				path: "import",
				children: [
					{
						path: "", component: ImportListComponent
					},
					{
						path: "importForm", component: ImportFormComponent
					}
				]
			},
			{
				path: "population",
				children: [
					{
						path: "populationForm",
						children: [
							{ path: "", component: PopulationFormComponent },
							{ path: ":id", component: PopulationFormComponent }
						]
					},
					{ path: "", component: populationListComponent }
				]
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(childRoutes),
		NgxDatatableModule,
		Daterangepicker,
		FormsModule,
		CommonModule,
		FileUploadModule,
		Ng2Bs3ModalModule,
		WeekRangePickerModule,
	],
	//4.添加工作区页面组件声明
	declarations: [
		ValidationDirective,
		DaterangepickerDirective,
		CutStringDirective,
		AdvertiserListComponent,
		AdvertiserFormComponent,
		AdvertiserAdxComponent,
		ProjectListComponent,
		ProjectFormComponent,
		CampaignListComponent,
		CampaignFormComponent,
		CreativeUploadListComponent,
		CreativeUploadFormComponent,
		LandpageFormComponent,
		LandpageListComponent,
		FlowListComponent,
		ModalWeekRangeComponent,
		ModalAppComponent,
		ModalRegionComponent,
		AnalysisComponent,
		populationListComponent,
		ImportListComponent,
		ImportFormComponent,
		ProjectMarkComponent,
		PageFooterComponent,
		PopulationFormComponent,
		ProjectRuleComponent,
		LoadingModalComponent,
		ProgressBarComponent,
		AppSynchroComponent,
		MyModalComponent,
		NobidAnalysisComponent,
		AdxAnalysisComponent,
		BidAnalysisComponent,

		LaunchStatusPipe,
		advertiserStatusPipe,
		landpageStatusPipe,
		imageFormatsPipe,
		videoFormatsPipe,
		creativeTypePipe,
		creativeStatusPipe,
		permillagePipe
	],
	providers:[
		ValidationService,
		BaseService,
		AdvertiserService,
		ProjectService,
		CodeService,
		CampaignService,
		CreativeService,
		AppTmplService,
		LandpageService,
		IndustryService,
		PopulationService,
		DataService,
		CutStringService,
		MyModalService,
		MaskService,
		AppService,
		ChineseService,
		RootService,
		PublicService
	],
	exports: [ RouterModule ]
})

export class RoutingModule {

}

