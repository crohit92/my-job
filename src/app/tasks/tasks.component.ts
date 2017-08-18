import { Component } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';

@Component({
    templateUrl: './tasks.html'
})
export class TasksComponent {
    tasks = []
    constructor(private api: Api) {
        this.fetchTasks();
    }

    fetchTasks() {
        this.api.sendRequest({ endpoint: ApiRoutes.FETCH_ALL_TASKS, method: 'get' })
            .subscribe(res => this.tasks = res.json(),
            err => console.log(err));
    }
}