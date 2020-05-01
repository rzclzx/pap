import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { RoutingModule } from "./routing.module";

import { MainComponent } from "./components/main.component";

import { AuthService } from "./services/auth.service"

@NgModule({
	imports: [ 
		BrowserModule, 
		FormsModule,
		RoutingModule,
		HttpModule,
		JsonpModule,
	],
	declarations: [
		MainComponent
	],
	providers:[ AuthService ],
	exports: [ MainComponent ]
})

export class MainModule { }