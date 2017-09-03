import { Input, Output, Component, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';
import { ModalDirective } from 'ngx-bootstrap';
import { ActivatedRoute,Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Account } from '../models/account.model';
@Component({
    templateUrl: './account.html',
    selector: 'account'
})
export class AccountComponent {
    @ViewChild('accountModal') public accountModal:ModalDirective;
    public isModalVisible:boolean = false;

    account:Account;
    constructor(
        private api: Api,
        private router:Router,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe(
            (params) => { this.account = JSON.parse(params.account) });
    }

    onModalHiding() {

        this.router.navigate(["/accounts"]);

    }

}