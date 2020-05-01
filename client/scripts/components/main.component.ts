import { Component,OnInit,ViewChildren,QueryList } from "@angular/core";
import { AuthService } from "../services/auth.service"
import { Router,ActivatedRoute,Params } from "@angular/router";
import { ChineseService } from "../services/chinese.service";
declare var $;
@Component({
	selector: "ng-main",
	templateUrl: "./dist/client/views/main.html"
})

export class MainComponent implements OnInit {

    @ViewChildren("childs") childs: QueryList<any>;

	errorMessage: string = "";
    
    userId: string;

    private navMain: Array<any> = this.chineseService.config.MENU_ARRAY;

    private currentArr: Array<any> = [0,1];

    private indexCache: number;

	constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private chineseService: ChineseService
	) {}

    ngOnInit() {
        this.currentInit();
    }

    private showChilds(index){
        this.removeChilds();
        if(index !== undefined){
            this.indexCache = index;
        }   
        this.childs.toArray()[this.indexCache].nativeElement.style.display = "flex";
    }
    private removeChilds(){
        let childs = this.childs.toArray();
        for(let i = 0;i < childs.length;i++){
            childs[i].nativeElement.style.display = "none";
        }
    }

    public currentInit(){
        // menu焦点初始化
        let path = location.hash.split("#")[1];
        for(let i = 0;i < this.navMain.length;i++){
            for(let j = 0;j < this.navMain[i].childs.length;j++){
                if(path.indexOf(this.navMain[i].childs[j].nav) !== -1){
                    this.currentArr[0] = i;
                    this.currentArr[1] = j;
                }
            }
        }
    }

    logout() {
        // 退出
        this.userId = window.localStorage.getItem('loginUserId');
        this.authService.logout(this.userId)
            .subscribe(
                resultInfo => this.gotoLogin(resultInfo),
                error => this.errorMessage = <any>error
            );
	}

    gotoLogin(resultInfo) {
        if (resultInfo && resultInfo.head.httpCode == 204) {
			this.router.navigate(["/login"]);
		}
    }

    private changeCurrent(type,i,j){
        // menu跳转
        if(type === "main"){
            if(this.currentArr[0] === i){
                return;
            }
            this.currentArr[0] = i;
            if(this.currentArr[0] === 0){
                this.currentArr[1] = 1;
            }else{
                this.currentArr[1] = 0;
            }
        }else{
            this.currentArr[1] = i;
            this.currentArr[0] = j;
            this.removeChilds();
        }
        this.router.navigate([this.navMain[this.currentArr[0]].childs[this.currentArr[1]].nav]);
        
    }
}
