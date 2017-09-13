import { Component } from '@angular/core';
import { Api, Request, ApiRoutes } from './../helper/api';
@Component({
    templateUrl: './users-list.html'
})
export class UsersListComponent {
    users:any[];
    selectedUser:any = {};
    constructor(
        private api: Api
    ) {
       this.fetchUsers();
    }

    fetchUsers(){
         this.api.sendRequest({
            endpoint:ApiRoutes.FETCH_ALL_USERS,
            method:'get'
        }).subscribe(
            res=>{this.users = res as any[]},
            err=>{console.log(err);}
        );
    }

}