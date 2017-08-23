import { TaskType } from './task-type'

import { ObjectID } from 'mongodb';
import { Customer } from './customer'
import { User } from './user';

export class Task {
    id:string;
    title: string;
    description: string;
    startsOn: Date;
    dueOn: Date;
    endsOn: Date;
    assignedToId: number;
    completed: boolean;
    payable: boolean;
    paid: boolean;
    type: TaskType;
    price: number;
    customerId: number;
    customer?: Customer;
    user?: User;
}