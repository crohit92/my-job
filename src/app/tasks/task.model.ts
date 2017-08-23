import { User } from './../users/user.model'
import { TaskType } from './task-type.model';

export class Task {
    id?: number;
    title?: string;
    description?: string;
    startsOn?: Date;
    dueOn?: Date;
    endsOn?: Date;
    assignedToId?: string;
    completed?: boolean;
    payable?: boolean;
    paid?: boolean;
    type?: TaskType;
    price?: number;
    customerId?: string;
}