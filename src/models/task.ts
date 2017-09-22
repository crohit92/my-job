import { CallType } from './call-type'

import { ObjectID } from 'mongodb';
import { User } from './user';

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
}