import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule,Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";
import { MainModule } from "./main.module";
import { LoginModule } from "./login.module";



import { MainComponent } from "./components/main.component";
import { LoginComponent } from "./components/login.component";
import { EntryComponent } from "./components/entry.component";
import { childRoutes } from "./routing.module";


const routes: Routes = [
	{ path: "home" , redirectTo: "home/project", pathMatch: "full" },
	{ 
		path: "home",
		component: MainComponent,
		children: childRoutes
	},
    { path: "login", component: LoginComponent },
    { path: "**" , redirectTo: "home/project", pathMatch: "full" }
];

@NgModule({
	imports: [ 
        RouterModule.forRoot(routes, { useHash: true }),
		BrowserModule, 
		FormsModule,
		HttpModule,
		JsonpModule,
        MainModule,
        LoginModule
	],
	declarations: [
        EntryComponent
	],
	
	bootstrap: [ EntryComponent ]
})

export class EntryModule { }