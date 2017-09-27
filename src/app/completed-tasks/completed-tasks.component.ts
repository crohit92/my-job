import { Component, OnInit } from '@angular/core';
import { Api, ApiRoutes } from "../helper/api";
import { Task } from "../models/task.model";
import { Utils } from "../helper/utils";

@Component({
  selector: 'app-completed-tasks',
  templateUrl: './completed-tasks.component.html',
  styleUrls: ['./completed-tasks.component.css']
})
export class CompletedTasksComponent implements OnInit {
  dueDate:Date;
  tasks:Task[];
  filterTask:string;
  constructor(
    private api:Api,
    private utils: Utils
  ) {
    this.utils.showMenu(true);
   }

  ngOnInit() {
  }

  fetchTasks() {
    this.api.sendRequest({
        endpoint: ApiRoutes.FETCH_ALL_TASKS,
        method: 'get',
        queryParams: {
            dueDate: this.dueDate
        }
    })
        .subscribe(res => {
            let tasks = res as Task[];
            (tasks as Task[]).forEach(t => {
                t.customer = t.customer[0];
                t.user = t.user[0];
            });
            this.tasks = tasks;
        }, err => console.log(err));
}
}
