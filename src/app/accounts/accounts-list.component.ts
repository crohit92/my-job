import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Account } from '../models/account.model';
import { Group } from '../models/group.model';
import { ToastrService } from 'ngx-toastr';
import { Utils } from '../helper/utils';
import { User } from '../models/user.model';
import { StorageService } from '../helper/storage.service';
import { Constants } from '../helper/constants';

@Component({
    templateUrl: './accounts-list.html'
})
export class AccountsListComponent {
    filterAccounts: string;
    fetchedAccounts: Account[] = [];
    accounts: Account[] = new Array<Account>();
    groups: Group[];
    selectedAccount: Account;
    limit = 40;
    pageNumber = 1;
    //used to show timeout while deleting a user
    timer: number
    @ViewChild('template') template: TemplateRef<any>;

    debtors_cretitors_users = ['15', '16', '17']
    users = ['17']
    user: User;
    public modalRef: BsModalRef;
    constructor(
        private api: Api,
        private alert: ToastrService,
        private router: Router,
        private modalService: BsModalService,
        private utils: Utils,
        private storage: StorageService
    ) {
        this.utils.showMenu(true);
        this.fetchAccounts();
        this.fetchGroups();
        this.user = this.storage.get(Constants.USER);
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
            const response = res as Account[];
            if (response.length) {
                this.fetchedAccounts = [...this.fetchedAccounts, ...response];
                this.accounts = [...this.fetchedAccounts];
                this.pageNumber += 1;
            }
        });
    }

    loadFilteredAccounts(ev: KeyboardEvent) {

        if (ev.keyCode === 13) {
            const filterString = (ev.target as HTMLInputElement).value;
            if (filterString) {
                this.api.sendRequest({
                    endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
                    method: 'get',
                    queryParams: {
                        filter: filterString
                    }
                }).subscribe((res) => {
                    const response = res as Account[];
                    if (response.length) {
                        this.accounts = response;
                    }
                });
            } else {
                this.accounts = this.fetchedAccounts;
            }
        }
    }

    fetchGroups() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_GROUPS,
            method: 'get'
        }).subscribe(
            (res) => { this.groups = res as Group[]; },
            (err) => { console.log(err); });
    }

    editAccount(account) {
        //reset the delete timer so that account is not accedintally deleted
        this.timer = undefined;
        this.selectedAccount = { ...account };
        this.modalRef = this.modalService.show(this.template);
    }

    showBlankModal() {
        this.selectedAccount = new Account();
        this.modalRef = this.modalService.show(this.template);
    }

    onAccountUpdated(id, account) {
        const updatedAccountIndex = this.accounts.findIndex(ac => ac.id === id);
        if (updatedAccountIndex !== -1) {
            this.accounts[updatedAccountIndex] = { ...account };
            this.filterAccounts = '';

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
                this.selectedAccount.group = [this.groups.find(g => g.id == this.selectedAccount.groupId)];
                this.onAccountUpdated(this.selectedAccount.id, this.selectedAccount);
            },
                (err) => this.alert.error(err.error.message, 'Error'));
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_ACCOUNT,
                method: 'post',
                body: this.selectedAccount
            }).subscribe((response) => {
                this.modalRef.hide();
                this.selectedAccount = response as Account;
                this.selectedAccount.group = [this.groups.find(g => g.id == this.selectedAccount.groupId)];
                this.accounts.push(this.selectedAccount);
            }, (res) => {
                this.alert.error(res.error.message || 'An Error Occured', 'Error');
            });
        }

    }

    deleteAccount() {
        if (this.user.id === this.selectedAccount.id) {
            this.alert.error('Cannot delete your own account');
            return;
        }
        if (this.timer == undefined || this.timer == 0) {
            this.api.sendRequest({
                endpoint: ApiRoutes.DELETE_ACCOUNT,
                method: 'delete',
                routeParams: {
                    '': this.selectedAccount.id
                },
                queryParams: {
                    force: this.timer === 0 ? 1 : 0
                }
            }).subscribe((response) => {
                this.timer = undefined;
                this.modalRef.hide();
                this.accounts = this.accounts.filter(a => a.id != this.selectedAccount.id);
            }, (res) => {
                this.alert.error(res.error.message || 'An Error Occured', 'Error');
                if (res.error.message) {
                    let count = 0;
                    let interval = setInterval(() => {
                        if (count == 3) {
                            clearInterval(interval);
                            this.timer = 0;
                        }
                        this.timer = 3 - count;
                        count++;
                    }, 1000)
                }
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