import { Component } from '@angular/core';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Account } from './account.model';
@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {

    accounts:Account[];
    constructor(
        private api: Api
    ) {
        this.fetchAccounts();
    }

    fetchAccounts() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_GROUPS,
            method: 'get'
        }).subscribe(
            res => { this.accounts = res.json() },
            err => { console.log(err); }
            );
    }

}