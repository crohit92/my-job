import {Account} from './account.model';
export class Transaction{
    id:string;
    debitAccountId:string;
    debit?:Account;
    creditAccountId:string;
    credit?:Account;
    amount:number;
    date:Date;
    narration:string;
    userId:string;
}