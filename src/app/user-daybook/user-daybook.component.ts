import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Transaction } from './../models/transaction.model';
import { User } from './../models/user.model';
import { Api, ApiRoutes } from './../helper/api';
import { StorageService } from './../helper/storage.service';
import { Constants } from "../helper/constants";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { Utils } from "../helper/utils";
@Component({
  selector: 'app-user-daybook',
  templateUrl: './user-daybook.component.html',
  styleUrls: ['./user-daybook.component.css']
})
export class UserDaybookComponent implements OnInit {
  fromDate: string;
  toDate: String;
  transaction: Transaction;
  transactions: Transaction[];
  user: User;
  public modalRef: BsModalRef;
  @ViewChild("template") template: TemplateRef<any>;
  constructor(private api: Api,
    private storage: StorageService,
    private modalService: BsModalService,
    private alert: ToastrService,
    private utils: Utils) {
    utils.showMenu(true);
  }

  ngOnInit() {
    this.user = this.storage.get(Constants.USER);
  }

  fetchTransactions() {
    this.api.sendRequest({
      endpoint: "transactions/users",
      routeParams: {
        "": this.user.id
      },
      queryParams: {
        fromDate: this.fromDate,
        toDate: this.toDate
      },
      method: "get",

    }).subscribe((transactions: Transaction[]) => {
      this.transactions = transactions;
    })
  }

  openTransactionModal() {
    this.transaction = new Transaction();
    this.modalRef = this.modalService.show(this.template);
  }

  saveTransaction() {
    let trans = new Transaction();
    trans.amount = this.transaction.amount;
    trans.userId = this.user.id;
    trans.narration = `${this.user.name} spent ${trans.amount} rs for ${this.transaction.narration}` ;

    this.api.sendRequest({
      endpoint: "transactions/users",
      routeParams: {
        "": this.user.id
      },
      method: "post",
      body: trans
    }).subscribe(() => {
      this.alert.success("Transaction Saved");
    },
      (err) => {
        this.alert.error(err.error.message || "An Error Occured", "Error");
      })
  }
}
