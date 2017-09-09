import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import 'rxjs'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { Account } from '../models/account.model';
import { Group } from '../models/group.model';

@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {
    filterAccounts: string;
    accounts: Account[] = new Array<Account>();
    groups: Observable<Group[]>;
    selectedAccount: Account;
    limit = 8;
    pageNumber = 1;
    @ViewChild("template") template: TemplateRef<any>;
    public modalRef: BsModalRef;
    constructor(
        private api: Api,
        private router: Router,
        private modalService: BsModalService
    ) {

        this.fetchAccounts();
        this.fetchGroups();
    }

    fetchAccounts() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
            method: 'get',
            queryParams: {
                page: this.pageNumber,
                limit: this.limit,
                skip: (this.pageNumber - 1) * this.limit
            }
        }).subscribe((res) => {
            let response = res.json() as Account[];
            if (response.length) {
                this.accounts = [...this.accounts, ...response];
                this.pageNumber += 1;
            }
        });
    }

    fetchGroups() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_GROUPS,
            method: 'get'
        }).subscribe((res) => this.groups = res.json());
    }

    editAccount(account) {
        this.selectedAccount = { ...account };
        this.modalRef = this.modalService.show(this.template);
    }

    showBlankModal() {
        this.selectedAccount = new Account();
        this.modalRef = this.modalService.show(this.template);
    }

    onAccountUpdated(id, account) {
        let updatedAccountIndex = this.accounts.findIndex(ac => ac.id == id);
        if (updatedAccountIndex != -1) {
            this.accounts[updatedAccountIndex] = { ...account };
        }
    }

    createUpdateAccount() {
        if (this.selectedAccount.id) {
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_ACCOUNT,
                method: 'put',
                body: this.selectedAccount,
                routeParams: {
                    '': this.selectedAccount.id
                }
            }).subscribe(() => {
                this.modalRef.hide();
                this.onAccountUpdated(this.selectedAccount.id, this.selectedAccount);
            })
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_ACCOUNT,
                method: 'post',
                body: this.selectedAccount
            }).subscribe((response) => {
                this.modalRef.hide();
                this.selectedAccount.id = response.json();
                this.accounts.push(this.selectedAccount);
            })
        }

    }

    compareItems(item1, item2) {
        return item1 && item2 ? item1 == item2 : false;
    }

    

    isBalanceNegative(account) {
        return account.balance < 0;
    }
}