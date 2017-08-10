import { Input, Component } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api'
@Component({
    templateUrl: './customer.html',
    selector: 'customer'
})
export class CustomerComponent {
    @Input('customer') customer: any = {};

    constructor(
        private api: Api
    ) { }
    updateCustomer() {
        debugger
        if (this.customer && this.customer._id) {
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_CUSTOMER,
                routeParams: {
                    '': this.customer._id
                },
                method: 'put',
                body: this.customer
            }).subscribe(
                res => { this.customer = {} },
                err => { console.log(err); }
                );
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_CUSTOMER,
                method: 'post',
                body: this.customer
            }).subscribe(
                res => { this.customer = {} },
                err => { console.log(err); }
                );
        }
    }

    deleteCustomer(event) {
        this.api.sendRequest({
            endpoint: ApiRoutes.DELETE_CUSTOMER,
            method: 'delete',
            routeParams: {
                '': this.customer._id
            }
        }).subscribe(
            res => { this.customer = {} },
            err => { console.log(err); }
            );
        event.stopPropagation();
    }
}