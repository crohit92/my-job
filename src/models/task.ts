import { TaskType } from './task-type'

import { ObjectID } from 'mongodb';
import { User } from './user';

export class Task {
    id:string;
    title: string;
    description: string;
    startsOn: Date;
    dueOn: Date;
    endsOn: Date;
    assignedToId: string;
    completed: boolean;
    payable: boolean;
    paid: boolean;
    type: TaskType;
    price: number;
    customerId: string;
    
}