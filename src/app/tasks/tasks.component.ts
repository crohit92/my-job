import { Component } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';
import { Task } from './task.model';
import { TASK_FREQUENCY_TYPES, TASK_TYPES} from './constants';

@Component({
    templateUrl: './tasks.html'
})
export class TasksComponent {
    tasks = []
    currentTask = {};
    taskTypes = TASK_TYPES;
    frequencyTypes = TASK_FREQUENCY_TYPES;

    constructor(private api: Api) {
        this.fetchTasks();
    }

    fetchTasks() {
        this.api.sendRequest({ endpoint: ApiRoutes.FETCH_ALL_TASKS, method: 'get' })
            .subscribe(res =>{
                let tasks = res.json();
                (tasks as Task[]).forEach(t=>{
                    t.customer = t.customer[0];
                    t.user = t.user[0];
                });
                
                this.tasks = tasks;
            }
        ,
            err => console.log(err));
    }

    getFrequencyTypeText(frequencyValue){
        return this.frequencyTypes.find((ft)=>ft.value == frequencyValue).text;
    }

    setCurrentTask(task:Task){
        this.currentTask = task
    }

    onTaskCreated(task: Task) {
        this.tasks.push(task);
        this.currentTask = {};
    }

    onTaskUpdated(task: Task) {
        let taskIndex = this.tasks.findIndex((t: Task) => { return t.id == task.id });
        if (taskIndex >= 0)
            this.tasks[taskIndex] = task;
        this.currentTask = {};
    }
}