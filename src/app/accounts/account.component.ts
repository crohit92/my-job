import { Input, Output, Component, EventEmitter } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api'
@Component({
    templateUrl: './account.html',
    selector: 'account'
})
export class AccountComponent {
    @Input('customer') customer: any = {};
    @Output('customerUpdated') customerUpdated = new EventEmitter<any>();
    @Output('customerDeleted') customerDeleted = new EventEmitter<any>();

    constructor(
        private api: Api
    ) { }
    // updateCustomer() {
    //     if (this.customer && this.customer.id) {
    //         this.api.sendRequest({
    //             endpoint: ApiRoutes.UPDATE_CUSTOMER,
    //             routeParams: {
    //                 '': this.customer.id
    //             },
    //             method: 'put',
    //             body: this.customer
    //         }).subscribe(
    //             res => {
    //                 this.customerUpdated.emit();
    //                 this.customer = {}
    //             },
    //             err => { console.log(err); }
    //             );
    //     }
    //     else {
    //         this.api.sendRequest({
    //             endpoint: ApiRoutes.CREATE_CUSTOMER,
    //             method: 'post',
    //             body: this.customer
    //         }).subscribe(
    //             res => {
    //                 this.customerUpdated.emit();
    //                 this.customer = {}
    //             },
    //             err => { console.log(err); }
    //             );
    //     }
    // }

    // deleteCustomer(event) {
    //     this.api.sendRequest({
    //         endpoint: ApiRoutes.DELETE_CUSTOMER,
    //         method: 'delete',
    //         routeParams: {
    //             '': this.customer.id
    //         }
    //     }).subscribe(
    //         res => { 
    //             this.customerDeleted.emit();
    //             this.customer = {} 
    //         },
    //         err => { console.log(err); }
    //         );
    // }
}