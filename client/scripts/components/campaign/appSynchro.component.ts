import { Component, OnInit} from "@angular/core";
import { AppService } from "../../services/app.service";
import { ChineseService } from "../../services/chinese.service";


@Component({
	selector: "app-synchro",
	templateUrl: "./dist/client/views/campaign/appSynchro.html"
})

export class AppSynchroComponent implements OnInit {

    private message = "";

    constructor(private appService: AppService,private chineseService: ChineseService){}

    ngOnInit() {
        this.appService.appSynchro().subscribe(
            result => {
                this.message = this.chineseService.config.SYNC_SUCCESS;
            },
            error => {
                this.message = this.chineseService.config.SYNC_FAIL;
            }
        )
    }
}