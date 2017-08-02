import { User } from './user';
import { TaskType } from './task-type'
import { Customer } from './customer';
export class Task {
    _id: string;
    title: string;
    description: string;
    startsOn: Date;
    endsOn: Date;
    restartsOn: Date;
    assignedTo: User;
    completed: boolean;
    payable: boolean;
    paid: boolean;
    type: TaskType;
    price: number;
    customer: Customer;
}