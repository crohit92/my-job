import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Constants } from './constants';
import { Api, ApiRoutes } from './api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
class Guard {
    constructor(
        private router: Router,
        private api: Api,
        private storage: StorageService
    ) { }

    sendAuthenticationResponse(checkIfAdmin: boolean): Observable<any> {
        const user = this.storage.get(Constants.USER);
        return this.api.sendRequest({
            body: user,
            endpoint: ApiRoutes.LOGIN,
            method: 'post'
        }).map((res: any) => {
            this.storage.set(Constants.USER, res);
            if (checkIfAdmin) {
                return res.admin > 0;
            } else {
                return true;
            }

        }).catch(err => {
            this.router.navigate(['login']);
            return Observable.throw(err);
        });

    }
}

@Injectable()
export class UserGuard extends Guard implements CanActivate {
    constructor(
        storage: StorageService,
        api: Api,
        router: Router) {
        super(router, api, storage);
    }
    canActivate(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

        return this.sendAuthenticationResponse(false);
    }

}


@Injectable()
export class AdminGuard extends Guard implements CanActivate {
    constructor(
        storage: StorageService,
        api: Api,
        router: Router) {
        super(router, api, storage);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {


        return this.sendAuthenticationResponse(true);
    }

}
