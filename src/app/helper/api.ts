import { Injectable } from '@angular/core';
import { Http, RequestOptionsArgs } from '@angular/http';
//const apiBase = 'https://glacial-bayou-25223.herokuapp.com/';
const apiBase = 'http://localhost:8080/';

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
    UPDATE_ACCOUNT: 'accounts',
    CREATE_ACCOUNT: 'accounts',
    CREATE_GROUP: 'groups',
    CREATE_TASK: 'tasks',
    DELETE_ACCOUNT: 'accounts',
    DELETE_TASK: 'tasks',
    DELETE_USER: 'users',
    FETCH_ALL_USERS: 'users',
    FETCH_ALL_TASKS: 'tasks',
    UPDATE_USER: 'users',
    UPDATE_TASK:'tasks',
    CREATE_USER: 'users',
}

@Injectable()
export class Api {
    constructor(private http: Http) { }

    private removeTrailingSlash(endpoint: string) {
        if (endpoint.endsWith('/')) {
            endpoint = endpoint.substr(0, endpoint.length - 1);
        }
        return endpoint;
    }

    private buildURL(endPoint: string, routeParams: any, queryParams: any): string {
        endPoint = this.removeTrailingSlash(endPoint);
        let route: string = `${apiBase}${endPoint}`;
        if (routeParams)
            for (var key in routeParams) {
                if (key == '') {
                    route = `${route}/${routeParams['']}`
                }
                else {
                    route = `${route}/${key}/${routeParams.key}`
                }

            }
        let paramChar = '?';
        if (queryParams)
            for (var key in queryParams) {
                route = `${route}${paramChar}${key}=${queryParams.key}`;
                paramChar = '&';
            }
        return route;
    }

    sendRequest(request: Request) {

        return this.http.request(
            this.buildURL(request.endpoint, request.routeParams, request.queryParams),
            {
                body: request.body,
                method: request.method
            });
    }






}
