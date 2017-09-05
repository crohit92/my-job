import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from "./models/transaction.model";

@Pipe({
 name: 'filter'
})
@Injectable()
export class Filter implements PipeTransform {
 transform(items: any[], field: string, value: string): any[] {
   if (!items) return [];
   if (!value) return items;
   return items.filter(it => it[field].toLowerCase().indexOf(value.toLowerCase())>=0);
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
      return (t.narration.toLowerCase().indexOf(value.toLowerCase())>=0 ||
              t.debit.name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase())>=0 ||
              t.credit.name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase())>=0)
    
    });
  }
 }