import { User } from './user.model';
import { Account } from './account.model';
import { CallType } from './task-type.model';
import { Moment } from "moment";
export class Task {
    id?: string;
    description?: string;
    startsOn?: Date;
    assignedToId?: string;
    completed?: boolean;
    payable?:boolean;
    amount?:number;
    type?: CallType;
    customerId?: string;
    user?: Account;
    userName?:string;
    customer?: Account;
    customerName?:string;
    nextDueDate?: Date;
    sequence?:number;
    [key:string]:any;
}