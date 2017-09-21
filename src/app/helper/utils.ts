import {Injectable} from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { User } from "../models/user.model";
export enum UserType {
    User,
    Admin,
    SuperAdmin
}
@Injectable()
export class Utils{
    private menuVisibilityEvents:Subject<boolean> = new Subject<boolean>();
    private loginEvents:Subject<UserType> = new Subject<UserType>();

    get subscribeMenuVisibitityEvents():Observable<boolean>{
        return this.menuVisibilityEvents.asObservable();
    }

    get subscribeLoginEvents():Observable<UserType>{
        return this.loginEvents.asObservable();
    }

    loginSuccess(user:User){
        this.loginEvents.next(user.admin as UserType)
    }

    showMenu(displayState:boolean){
        this.menuVisibilityEvents.next(displayState);
    }
}