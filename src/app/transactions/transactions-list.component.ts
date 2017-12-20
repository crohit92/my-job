import { Component, TemplateRef, ViewChild, OnInit, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes, apiBase, appVersion } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Account } from '../../app/models/account.model';
import { Transaction } from '../../app/models/transaction.model';
import { Utils } from '../helper/utils';
import { FormControl } from '@angular/forms';
import { NgxAsyncSelectComponent } from '../ngx-async-select/ngx-async-select.component';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing';
@Component({
    templateUrl: './transactions-list.html',
    styles: [`
        .transaction{
            margin-top: 0.5rem;
        }

        .transaction div{
            padding: 1rem;
        }
    `]
})
export class TransationsListComponent {

    accounts: Account[];
    accountInfo: any;
    filter: any = {};
    transactions: Transaction[] = new Array<Transaction>();
    currentTransaction: Transaction;
    filterByDate: boolean;
    filterType: number;
    sharableAccountDetail: string;
    config = {
        animated: false,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };

    itemSelected(item) {
        console.log(item);

    }

    @ViewChild('template') template: TemplateRef<any>;
    public modalRef: BsModalRef;
    filterText: string;
    constructor(
        private api: Api,
        private router: Router,
        private modalService: BsModalService,
        private utils: Utils,
        private socialSharing: SocialSharing
    ) {
        this.utils.showMenu(true);
        // this.fetchAccounts();
    }

    showBlankModal() {
        this.currentTransaction = new Transaction();
        this.modalRef = this.modalService.show(this.template, this.config);
    }
    editTransaction(transaction: Transaction) {
        this.currentTransaction = { ...transaction };
        this.modalRef = this.modalService.show(this.template, this.config);
    }

    // fetchAccounts() {
    //     this.api.sendRequest({
    //         endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
    //         method: 'get'
    //     }).subscribe((res) => this.accounts = res as Account[]);
    // }

    fetchTransactions(params) {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_TRANSACTIONS,
            method: 'get',
            queryParams: params
        }).subscribe((res) => {
            this.transactions = res as Transaction[];
        });
    }

    onTransactionUpdated(id: string, transaction: Transaction) {
        const updatedTransactionIndex = this.transactions.findIndex(tr => tr.id === id);
        if (updatedTransactionIndex !== -1) {
            this.transactions[updatedTransactionIndex] = { ...transaction };
        }
    }

    saveTransaction() {
        this.currentTransaction.debitAccountId = this.currentTransaction.debit.id;
        this.currentTransaction.creditAccountId = this.currentTransaction.credit.id
        if (this.currentTransaction.id) {
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_TRANSACTION,
                method: 'put',
                routeParams: {
                    '': this.currentTransaction.id
                },
                body: this.currentTransaction
            }).subscribe(() => {
                this.filterTransactions(this.filterType, this.filterByDate, this.filter);
                this.modalRef.hide();
            });
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_TRANSACTION,
                method: 'post',
                body: this.currentTransaction
            }).subscribe((response) => {
                this.currentTransaction.id = (response as any).id;
                this.filterTransactions(this.filterType, this.filterByDate, this.filter);
                this.modalRef.hide();

            });
        }

    }

    compareItems(item1, item2) {
        return item1 && item2 ? item1.id == item2.id : false;
    }

    displayFn(account: Account): string {
        return account ? account.name : '';
    }

    filterTransactions(filterType, filterByDate, filter) {
        //clear the file path if any exists
        this.sharableAccountDetail = undefined;

        let queryParams = filterByDate || filterType == 1 ? { from: this.filter.fromDate, to: this.filter.toDate } : {};
        if (filterType == 1) {
            queryParams = { ...queryParams, type: 1 };
        }
        else if (filterType == 2) {
            this.fetchAccountBalance(this.filter.accountId);
            queryParams = {
                ...queryParams, ...{
                    type: 2,
                    accountId: filter.accountId
                }
            }

        }
        else if (filterType == 3) {
            queryParams = {
                ...queryParams,
                ...{
                    type: 3,
                    text: filter.text
                }
            }
        }
        this.fetchTransactions(queryParams);
    }
    canFilter(filterType: number, filterByDate: boolean) {
        let filterByDateExp = filterByDate ? this.filter.fromDate && this.filter.toDate : true;
        if (filterType == 1) {
            return this.filter.fromDate && this.filter.toDate;
        }
        else if (filterType == 2) {
            return filterByDateExp && this.filter.accountId
        }
        else if (filterType == 3) {
            return filterByDateExp && this.filter.text
        }
    }

    fetchAccountBalance(accountId: string): any {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
            method: 'get',
            routeParams: {
                '': accountId
            }
        }).subscribe((response) => {
            let accountInfo = response;
            this.calculateBalance(accountInfo);
            this.accountInfo = accountInfo;
        })
    }
    calculateBalance(account) {
        let accountBalance = 0;
        if (account.accountType.nature == 'dr') {
            accountBalance += (account.debit - account.credit);
            if (account.natureOfOB == 'dr') {
                accountBalance += account.openingBalance;
            }
            else {
                accountBalance -= account.openingBalance;
            }
        }
        else {
            accountBalance += (account.credit - account.debit);
            if (account.natureOfOB == 'dr') {
                accountBalance -= account.openingBalance;
            }
            else {
                accountBalance += account.openingBalance;
            }
        }
        if (account.accountType.nature == 'dr') {
            account.balanceType = accountBalance < 0 ? 'cr' : 'dr';
        }
        else {
            account.balanceType = accountBalance < 0 ? 'dr' : 'cr';
        }
        account.balance = Math.abs(accountBalance);
        return accountBalance;

    }

    share() {
        let headers = [{ text: 'Date', bold: true }, { text: 'Description', bold: true }, { text: 'Amount', bold: true }];
        // var docDefinition = {
        //     content:[
        //         {
        //             table:{
        //                 body : [
        //                     headers,
        //                     ['2017-10-02','Test','2500 rs'],
        //                     ['2017-10-03','Test','3000 rs'],
        //                 ]
        //             }
        //         }
        //     ]
        // }
        this.api.sendRequest({
            method: 'post',
            body: {
                accountInfo: this.accountInfo,
                transactions: this.transactions
            },
            endpoint: `accounts/${this.filter.accountId}/makeStatement`,

        }).subscribe((data) => {
            this.sharableAccountDetail = `${apiBase}pdfs/${this.filter.accountId}.pdf?appVersion=${appVersion}`;
        })
    }

    shareTransaction(transaction: Transaction) {
        let debitAccountNameLength = transaction.debit.name.length;
        let creditAccountNameLength = transaction.credit.name.length;
        debitAccountNameLength = debitAccountNameLength > 'Account(Dr)'.length ? debitAccountNameLength : 12;
        creditAccountNameLength = creditAccountNameLength > 'Account(Dr)'.length ? creditAccountNameLength : 12;
        let message = '';
        message = `
        Date: ${moment(transaction.date).format('DD-MMM-YYYY')}
        ${Utils.padLeft('', debitAccountNameLength + creditAccountNameLength + 8, '_')}
        ${Utils.padRight('Account(Dr)', debitAccountNameLength)}        | Account(Cr)
        ${Utils.padLeft('', debitAccountNameLength + creditAccountNameLength + 8, '_')}
        ${Utils.padRight(transaction.debit.name, debitAccountNameLength)}        | ${transaction.credit.name}
        ${Utils.padLeft('', debitAccountNameLength + creditAccountNameLength + 8, '_')}
        ${transaction.narration}`;
        this.socialSharing.share(message, 'Transaction');
    }
}