import { Component, Input } from '@angular/core';
import { Task } from './task.model';
import { User } from './../users/user.model';
import { Customer } from './../customers-list/customer.model'
import { Api, Request, ApiRoutes } from './../helper/api';

@Component({
    templateUrl: './task.html',
    selector: 'task'

})
export class TaskComponent {
    @Input("currentTask") task: Task = new Task();
    users:User[];
    customer:Customer[];
    customers:any[];
    constructor(private api: Api) { 
        //fetch users
        this.api.sendRequest({
            endpoint:ApiRoutes.FETCH_ALL_USERS,
            method:"get"
        }).subscribe((res=>this.users = res.json()))
        
        //fetch customers
         this.api.sendRequest({
            endpoint:ApiRoutes.FETCH_ALL_CUSTOMERS,
            method:"get"
        }).subscribe((res=>this.customers = res.json()))
    }

    createOrUpdateTask(task: Task) {
        if (task && task.id) {
            this.updateTask(task);
        }
        else {
            this.createTask(task);
        }
    }

    createTask(task: Task) {
        this.api.sendRequest({
            body: task,
            endpoint: ApiRoutes.CREATE_TASK,
            method: 'post'
        })
            .subscribe(
            res => { this.task = null },
            err => console.log(err)

            )
    }

    updateTask(task: Task) {
        this.api.sendRequest({
            body: task,
            endpoint: ApiRoutes.UPDATE_TASK,
            method: 'put',
            routeParams: {
                '': task.id
            }
        })
            .subscribe(
            res => { this.task = null },
            err => console.log(err)

            )
    }
}
