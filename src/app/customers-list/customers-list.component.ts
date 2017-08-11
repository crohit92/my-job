import { Component } from '@angular/core';
import { Api, Request, ApiRoutes } from './../helper/api';
@Component({
    templateUrl: './customers-list.html',
    styleUrls: [
        './customers-list.css'
    ]
})
export class CustomersListComponent {
    customers:any[];
    selectedCustomer:any = {};
    constructor(
        private api: Api
    ) {
       this.fetchCustomers();
    }

    fetchCustomers(){
         this.api.sendRequest({
            endpoint:ApiRoutes.FETCH_ALL_CUSTOMERS,
            method:'get'
        }).subscribe(
            res=>{this.customers = res.json()},
            err=>{console.log(err);}
        );
    }

}