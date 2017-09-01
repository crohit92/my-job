import { Component } from '@angular/core';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Account } from './account.model';
@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {

    accounts:Account[];
    public selected:string;
    public states:string[] = ['Alabama', 'Alaska', 'Arizona', 'Arkansas',
      'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
      'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico',
      'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming'];
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