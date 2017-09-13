import { Component } from '@angular/core';
import { StorageService } from "../helper/storage.service";
import { User } from "../models/user.model";
import { Constants } from "../helper/constants";

@Component({
    templateUrl:'./home.html'
})
export class HomeComponent{
    user:User;
    constructor(
        private storage:StorageService
    ){
        this.user = this.storage.get(Constants.USER);
    }
}