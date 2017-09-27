import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgProgressService } from 'ngx-progressbar';
import { HttpRequest } from "@angular/common/http";
import { HttpResponse } from "@angular/common/http";
import { HttpEvent } from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
//const apiBase = 'https://pacific-coast-70867.herokuapp.com/';
const apiBase = 'http://34.230.30.149:3001/';

export class Request {
    endpoint: string;
    routeParams?: any;
    queryParams?: any;
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

@Injectable()
export class Api {
    constructor(private http: HttpClient,
        public progressService: NgProgressService) { }

    private removeTrailingSlash(endpoint: string) {
        if (endpoint.endsWith('/')) {
            endpoint = endpoint.substr(0, endpoint.length - 1);
        }
        return endpoint;
    }

    private buildURL(endPoint: string, routeParams: any, queryParams: any): string {
        endPoint = this.removeTrailingSlash(endPoint);
        let route: string = `${apiBase}${endPoint}`;
        if (routeParams){
            for (var key in routeParams) {
                if (key == '') {
                    route = `${route}/${routeParams['']}`
                }
                else {
                    route = `${route}/${key}/${routeParams[key]}`
                }
            }
        }
        let paramChar = '?';
        if (queryParams)
            for (var key in queryParams) {
                route = `${route}${paramChar}${key}=${queryParams[key]}`;
                paramChar = '&';
            }
        return route;
    }

    sendRequest(request: Request) {
        this.progressService.start();

        return this.http.request(
            request.method,
            this.buildURL(request.endpoint, request.routeParams, request.queryParams),
            {
                body: request.body
            });
    }






}
