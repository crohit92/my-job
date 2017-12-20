import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { User } from "../models/user.model";
export enum UserType {
    User,
    Admin,
    SuperAdmin
}
@Injectable()
export class Utils {
    private menuVisibilityEvents: Subject<boolean> = new Subject<boolean>();
    private loginEvents: Subject<UserType> = new Subject<UserType>();

    static padLeft(text: string, length: number, padWith: string = ' ') {
        let result = text;
        while (result.length < length) {
            result = (padWith ? padWith : ' ') + result;
        }
        return result;
    }

    static padRight(text: string, length: number, padWith: string = ' ') {
        let result = text;
        while (result.length < length) {
            result = result + (padWith ? padWith : ' ');
        }

        return result;
    }

    get subscribeMenuVisibitityEvents(): Observable<boolean> {
        return this.menuVisibilityEvents.asObservable();
    }

    get subscribeLoginEvents(): Observable<UserType> {
        return this.loginEvents.asObservable();
    }

    loginSuccess(user: User) {
        this.loginEvents.next(user.admin as UserType)
    }

    showMenu(displayState: boolean) {
        this.menuVisibilityEvents.next(displayState);
    }


}