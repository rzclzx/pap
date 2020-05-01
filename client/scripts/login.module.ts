import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";

import { LoginComponent } from "./components/login.component";
import { AuthService } from "./services/auth.service";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		JsonpModule
	],
	declarations: [ LoginComponent ],
	providers: [ AuthService ],
	exports: [ LoginComponent ]
})

export class LoginModule { }
