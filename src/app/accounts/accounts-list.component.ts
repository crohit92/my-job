import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import 'rxjs'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { Account } from '../models/account.model';
import { Group } from '../models/group.model';
import { ToastrService } from "ngx-toastr";

@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {
    filterAccounts: string;
    accounts: Account[] = new Array<Account>();
    groups: Group[];
    selectedAccount: Account;
    limit = 40;
    pageNumber = 1;
    @ViewChild("template") template: TemplateRef<any>;

    debtors_cretitors_users = ['15', '16', '17']
    users = ['17']
    public modalRef: BsModalRef;
    constructor(
        private api: Api,
        private alert: ToastrService,
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
            let response = res as Account[];
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
        }).subscribe((res) => this.groups = res as Group[]);
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
            this.filterAccounts = "";

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
                this.selectedAccount.group = [this.groups.find(g=>g.id == this.selectedAccount.groupId)];
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
                this.selectedAccount = response as Account;
                this.selectedAccount.group = [this.groups.find(g=>g.id == this.selectedAccount.groupId)];
                this.accounts.push(this.selectedAccount);
            },
                (res) => {
                    this.alert.error(res.error.message || "An Error Occured", "Error");
                })
        }

    }

    deleteAccount() {
        this.api.sendRequest({
            endpoint: ApiRoutes.DELETE_ACCOUNT,
            method: 'delete',
            routeParams: {
                "": this.selectedAccount.id
            }
        }).subscribe((response) => {
            this.modalRef.hide();
            this.accounts = this.accounts.filter(a => a.id != this.selectedAccount.id);
        },(res) => {
            this.alert.error(res.error.message || "An Error Occured", "Error");
        })
    }

    compareItems(item1, item2) {
        return item1 && item2 ? item1 == item2 : false;
    }

    isBalanceNegative(account) {
        return account.balance < 0;
    }
}