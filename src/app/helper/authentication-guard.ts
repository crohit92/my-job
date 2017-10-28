import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { StorageService } from "./storage.service";
import { Constants } from "./constants";

class Guard{
    constructor(
        private router: Router
    ){}

    sendAuthenticationResponse(isAuthenticated:boolean):boolean{
        if(!isAuthenticated){
            this.router.navigate(['login']);
        }
        return isAuthenticated;
    }
}

@Injectable()
export class UserGuard extends Guard implements CanActivate {
    constructor(
        private storage: StorageService,
        router: Router) { 
            super(router);
        }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        let user = this.storage.get(Constants.USER)
        return this.sendAuthenticationResponse(user != null);
    }

}


@Injectable()
export class AdminGuard extends Guard implements CanActivate {
    constructor(
        private storage: StorageService,
        router: Router) {
            super(router);
        }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        let user = this.storage.get(Constants.USER)
        return this.sendAuthenticationResponse(user && user.admin > 0);
    }

}