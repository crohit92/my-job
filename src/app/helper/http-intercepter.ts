import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { NgProgress } from "ngx-progressbar";

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
    constructor(
        public progressService: NgProgress
    ){
        
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
 
        return next.handle(req).do(event => {
            if (event instanceof HttpResponse || event instanceof HttpErrorResponse) {
                this.progressService.done();
            }
        }).finally(()=>{
            this.progressService.done();
        })

    }
}