import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Account } from '../models/account.model'
import { Api, Request, ApiRoutes } from './../helper/api';
import {  TASK_TYPES} from './constants';
@Component({
    templateUrl: './task.html',
    selector: 'task'

})
export class TaskComponent {
    @Input("task") task: Task = new Task();
    @Output("taskCreated") taskCreated: EventEmitter<Task> = new EventEmitter<Task>();
    @Output("taskUpdated") taskUpdated: EventEmitter<Task> = new EventEmitter<Task>();
    @Output("taskDeleted") taskDeleted: EventEmitter<Task> = new EventEmitter<Task>();

    users: User[];
    customer: Account[];
    customers: any[];
    frequencies: any[];
    taskTypes: any[];

    constructor(private api: Api) {
        //fetch users
       

        this.taskTypes = TASK_TYPES;
    }

    

    deleteTask(task:Task){
        this.api.sendRequest({
            endpoint: ApiRoutes.DELETE_TASK,
            method: 'delete',
            routeParams: {
                '': this.task.id
            }
        }).subscribe(()=>{
            this.taskDeleted.emit(task);
            this.task = {}
        })
    }

    reset(){
        this.task =  {};
    }
    
}
