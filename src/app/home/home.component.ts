import { Component,OnDestroy } from '@angular/core';
import { StorageService } from "../helper/storage.service";
import { User } from "../models/user.model";
import { Constants } from "../helper/constants";
import { Utils } from "../helper/utils";
import { Subscription } from "rxjs/Subscription";

@Component({
    templateUrl: './home.html'
})
export class HomeComponent implements OnDestroy {
    user: User;
    userType: number;
    constructor(
        private storage: StorageService,
        private utils: Utils
    ) {
        this.user = this.storage.get(Constants.USER);
        this.utils.showMenu(true);
        
            this.userType = this.storage.get(Constants.USER).admin;
       
    }
    ngOnDestroy(){
        
    }
}