import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Account } from '../models/account.model'
import { Api, Request, ApiRoutes } from './../helper/api';
import { TASK_FREQUENCY_TYPES, TASK_TYPES} from './constants';
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
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_USERS,
            method: "get"
        }).subscribe((res => this.users = res.json()))

        //fetch customers
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_ACCOUNTS,
            method: "get"
        }).subscribe((res => this.customers = res.json()))

        this.frequencies = TASK_FREQUENCY_TYPES;

        this.taskTypes = TASK_TYPES;
    }

    createOrUpdateTask(task: Task) {
        
        
        if(this.task.user)
            this.task.assignedToId = this.task.user.id;
        else{
            this.task.assignedToId = null;
        }
        if(this.task.customer)
            this.task.customerId = this.task.customer.id;
        else{
            this.task.customerId = null;
        }

        if (task && task.id) {
            this.updateTask(task);
        }
        else {
            this.createTask(task);
        }
    }

    createTask(task: Task) {
        this.api.sendRequest({
            body: this.task,
            endpoint: ApiRoutes.CREATE_TASK,
            method: 'post'
        })
            .subscribe(
            res => {
            this.task.id = ""+res.json(); 
            this.taskCreated.emit(this.task);
            this.task = {};
            },
            err => console.log(err)

            )
    }

    updateTask(task: Task) {
        this.api.sendRequest({
            body: this.task,
            endpoint: ApiRoutes.UPDATE_TASK,
            method: 'put',
            routeParams: {
                '': this.task.id
            }
        })
            .subscribe(
            res => { 
                
                this.taskUpdated.emit(this.task);
                this.task = {}
            },
            err => console.log(err)

            )
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
    matchById(obj1,obj2){
       return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
    }
}
