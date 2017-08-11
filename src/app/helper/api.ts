import { Injectable } from '@angular/core';
import { Http,RequestOptionsArgs } from '@angular/http';
const apiBase = 'http://localhost:2000/';

export class Request{
    endpoint:string;
    routeParams?:any;
    queryParams?:any;
    body?:any;
    method:string;
}

export const ApiRoutes = {
    FETCH_ALL_CUSTOMERS:'customers',
    UPDATE_CUSTOMER:'customers',
    CREATE_CUSTOMER:'customers',
    DELETE_CUSTOMER:'customers',
    FETCH_ALL_USERS:'users',
    UPDATE_USER:'users',
    CREATE_USER:'users',
    DELETE_USER:'users',
}

@Injectable()
export class Api{
    constructor(private http:Http){}

    private removeTrailingSlash(endpoint:string){
        if(endpoint.endsWith('/')){
            endpoint = endpoint.substr(0,endpoint.length - 1);
        }
        return endpoint;
    }

    private buildURL(endPoint:string,routeParams:any,queryParams:any):string{
        endPoint = this.removeTrailingSlash(endPoint);
        let route:string = `${apiBase}${endPoint}`;
        if(routeParams)
            for (var key in routeParams) {
                if(key == ''){
                    route = `${route}/${routeParams['']}` 
                }
                else{
                    route = `${route}/${key}/${routeParams.key}` 
                }
            
            }
        let paramChar = '?';
        if(queryParams)
            for (var key in queryParams) {
                route = `${route}${paramChar}${key}=${queryParams.key}`;
                paramChar = '&';
            }
        return route;
    }

    sendRequest(request:Request){
        
        return this.http.request(
            this.buildURL(request.endpoint,request.routeParams,request.queryParams),
            {
                body:request.body,
                method:request.method
            });
    }






}
