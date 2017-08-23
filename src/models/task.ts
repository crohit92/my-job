import { TaskType } from './task-type'

export class Task {
    _id: string;
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