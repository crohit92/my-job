import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Api, Request, ApiRoutes } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import 'rxjs'
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { Account } from '../../app/models/account.model';
import { Transaction } from '../../app/models/transaction.model';

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
    accounts: Observable<Account[]>;
    transactions: Observable<Transaction[]>;
    currentTransaction: Transaction;
    config = {
        animated: false,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild("template") template: TemplateRef<any>;
    public modalRef: BsModalRef;
    constructor(
        private api: Api,
        private router: Router,
        private modalService: BsModalService
    ) {

        this.fetchAccounts();
        this.fetchTransactions();
    }

    showBlankModal() {
        this.currentTransaction = new Transaction();
        this.modalRef = this.modalService.show(this.template,this.config);
    }
    editTransaction(transaction: Transaction) {
        this.currentTransaction = { ...transaction };
        this.modalRef = this.modalService.show(this.template,this.config);
    }

    fetchAccounts() {
        this.accounts = this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
            method: 'get'
        })
            .map((res) => res.json());
    }

    fetchTransactions() {
        this.transactions = this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_TRANSACTIONS,
            method: 'get'
        })
            .map((res) => res.json());
    }



    saveTransaction() {
        if (this.currentTransaction.id) {
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_TRANSACTION,
                method: 'put',
                routeParams: {
                    '': this.currentTransaction.id
                },
                body: this.currentTransaction
            }).subscribe(() => {
                this.modalRef.hide();
                this.fetchTransactions();
            });
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_TRANSACTION,
                method: 'post',
                body: this.currentTransaction
            }).subscribe(() => {
                this.modalRef.hide();
                this.fetchTransactions();
            });
        }

    }
}