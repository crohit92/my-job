import { Component, Input } from '@angular/core';
import { Task } from './task.model';
import { Api, Request, ApiRoutes } from './../helper/api';

@Component({
    templateUrl: './task.html',
    selector: 'task'

})
export class TaskComponent {
    @Input("currentTask") currentTask: Task;

    constructor(private api: Api) { }

    createOrUpdateTask(task: Task) {
        if (task && task._id) {
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
            res => { this.currentTask = null },
            err => console.log(err)

            )
    }

    updateTask(task: Task) {
        this.api.sendRequest({
            body: task,
            endpoint: ApiRoutes.UPDATE_TASK,
            method: 'put',
            routeParams: {
                '': task._id
            }
        })
            .subscribe(
            res => { this.currentTask = null },
            err => console.log(err)

            )
    }
}
