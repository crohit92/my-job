import { User } from './../users/user.model';
import { Account } from './../accounts/account.model';
import { TaskType } from './task-type.model';

export class Task {
    id?: string;
    title?: string;
    description?: string;
    startsOn?: Date;
    frequency?: number;
    assignedToId?: string;
    completed?: boolean;
    payable?: boolean;
    paid?: boolean;
    type?: TaskType;
    price?: number;
    customerId?: string;
    user?: User;
    customer?: Account
    //used for computational purpose only
    nextDueDate?: any
}