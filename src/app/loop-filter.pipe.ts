import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from "./models/transaction.model";
import { Account } from './models/account.model';
import { Task } from "./models/task.model";

@Pipe({
  name: 'filter'
})
@Injectable()
export class Filter implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    let itemsPassingFilter: any[] = [];
    if (!items) return [];
    if (!value) return items;

    return items.filter(it => it[field as string].toLowerCase().indexOf(value.toLowerCase()) >= 0);


  }

  intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
      return b.indexOf(e) > -1;
    });
  }
}

@Pipe({
  name: 'filterTransactions'
})
@Injectable()
export class FilterTransactions implements PipeTransform {
  transform(transactions: Transaction[], value: string): any[] {
    if (!transactions) return [];
    if (!value) return transactions;
    return transactions.filter(t => {
      return (t.narration.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        t.debit.name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0 ||
        t.credit.name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0)

    });
  }
}


@Pipe({
  name: 'filterAccounts'
})
@Injectable()
export class FilterAccounts implements PipeTransform {
  transform(accounts: Account[], value: string): any[] {
    if (!accounts) return [];
    if (!value) return accounts;
    return accounts.filter(a => {
      return (a.name.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        a.group[0].name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0) ||
        a.openingBalance.toString().indexOf(value) >= 0 ||
        a.natureOfOB.indexOf(value.toLowerCase()) >= 0
    });
  }
}

@Pipe({
  name: 'filterTasks'
})
@Injectable()
export class FilterTasks implements PipeTransform {
  transform(tasks: Task[], value: string): any[] {
    if (!tasks) return [];
    if (!value) return tasks;
    return tasks.filter(a => {
      return (a.description.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        a.customer.name.toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        (a.user ? a.user.name.toLowerCase().indexOf(value.toLowerCase()) >= 0 : false)
      );
    })
  }
}