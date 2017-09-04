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

    accounts: Observable<Account[]>;
    groups:Observable<Group[]>;
    selectedAccount:Account;

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
        this.accounts = this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
            method: 'get'
        })
        .map((res)=>res.json());
    }

    fetchGroups(){
        this.groups = this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_GROUPS,
            method: 'get'
        })
        .map((res)=>res.json());
    }

    editAccount(account) {
        this.selectedAccount = {...account};
        this.modalRef = this.modalService.show(this.template);
    }

    showBlankModal(){
        this.selectedAccount = new Account();
        this.modalRef = this.modalService.show(this.template);
    }

    createUpdateAccount(){
        if(this.selectedAccount.id){
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_ACCOUNT,
                method: 'put',
                body:this.selectedAccount,
                routeParams:{
                    '':this.selectedAccount.id
                }
            }).subscribe(()=>{
                this.modalRef.hide();
                this.fetchAccounts();
            })
        }
        else{
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_ACCOUNT,
                method: 'post',
                body:this.selectedAccount
            }).subscribe(()=>{
                this.modalRef.hide();
                this.fetchAccounts();
            })
        }
        
    }

    compareItems(item1,item2){
        return item1 && item2 ? item1 == item2:false;
    }

}