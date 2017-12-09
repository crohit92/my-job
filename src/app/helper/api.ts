import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgProgressService } from 'ngx-progressbar';
import { HttpRequest } from "@angular/common/http";
import { HttpResponse } from "@angular/common/http";
import { HttpEvent } from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
//const apiBase = 'https://pacific-coast-70867.herokuapp.com/';
export const apiBase = 'http://localhost:3000/';
//export const apiBase = 'http://34.230.30.149:3001/';

export class Request {
    apiBase?: string;
    endpoint: string;
    routeParams?: { [key: string]: number | string | Date };
    queryParams?: { [key: string]: number | string | Date };
    body?: any;
    method: string;
}

export const ApiRoutes = {
    FETCH_ALL_GROUPS: 'groups',
    FETCH_ALL_ACCOUNTS: 'accounts',
    FETCH_ALL_USERS: 'accounts?groupId=17',
    FETCH_ALL_TASKS: 'tasks',
    FETCH_ALL_CUSTOMERS: 'accounts?groupId=16',
    FETCH_ALL_TRANSACTIONS: 'transactions',
    FETCH_ALL_PROJECT_PARAMETERS: 'tasks/projectParameters',

    UPDATE_ACCOUNT: 'accounts',
    UPDATE_USER: 'users',
    UPDATE_TASK: 'tasks',
    UPDATE_TRANSACTION: 'transactions',

    CREATE_USER: 'users',
    CREATE_ACCOUNT: 'accounts',
    CREATE_GROUP: 'groups',
    CREATE_TASK: 'tasks',
    CREATE_TRANSACTION: 'transactions',
    LOGIN: 'accounts/login',
    COMPLETE_TASK: 'tasks',

    DELETE_ACCOUNT: 'accounts',
    DELETE_TASK: 'tasks',
    DELETE_USER: 'users',
}

const appVersion = '1.0.0';

@Injectable()
export class Api {
    private localCache = {};
    constructor(private http: HttpClient,
        public progressService: NgProgressService) { }

    private removeTrailingSlash(endpoint: string) {
        if (endpoint.endsWith('/')) {
            endpoint = endpoint.substr(0, endpoint.length - 1);
        }
        return endpoint;
    }

    private buildURL(request: Request): string {
        request.endpoint = this.removeTrailingSlash(request.endpoint);
        let route = this.removeTrailingSlash(`${request.apiBase ? request.apiBase : apiBase}${request.endpoint}`);
        if (request.routeParams) {
            for (const key in request.routeParams) {
                if (key === '') {
                    route = `${route}/${request.routeParams['']}`;
                } else {
                    route = `${route}/${key}/${request.routeParams[key]}`;
                }
            }
        }
        let paramChar = route.indexOf('?') >= 0 ? '&' : '?';
        if (request.queryParams) {
            for (const key in request.queryParams) {
                if (request.queryParams.hasOwnProperty(key)) {
                    route = `${route}${paramChar}${key}=${request.queryParams[key]}`;
                    paramChar = '&';
                }
            }
        }
        route += `${paramChar}appVersion=${appVersion}`;
        return route;
    }

    sendRequest(request: Request) {

        const finalUrl = this.buildURL(request);
        // if (this.localCache.hasOwnProperty(finalUrl)) {
        //     return Observable.of(this.localCache[finalUrl]);
        // }

        this.progressService.start();
        return this.http.request(
            request.method,
            finalUrl,
            {
                body: request.body
            }).map(res => {
                this.localCache[finalUrl] = res;
                return res;
            });
    }






}
