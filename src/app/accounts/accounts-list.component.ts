import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Account } from '../models/account.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { INSERT, INSERT_MULTIPLE } from './../reducers/generic.reducer';
import { AppState } from './../app.state';
@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {

    accounts: Observable<Account[]>;
    constructor(
        private api: Api,
        private router: Router,
        private store: Store<AppState>
    ) {
        this.accounts = this.store.select(state=>state.accounts);
        this.fetchAccounts();
    }

    fetchAccounts() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_GROUPS,
            method: 'get'
        }).subscribe(
            res => { this.store.dispatch({type:INSERT_MULTIPLE,payload:res.json()}) },
            err => { console.log(err); }
            );
    }

    editAccount(account) {
        //this.router.navigate(["/account", { account: JSON.stringify(account) }])
        this.store.dispatch({
            type:INSERT,
            payload:{"name":"Bank Accounts","accountTypeId":"1"}
        })
    }

}