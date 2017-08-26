import { Component } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';
import { Task } from './task.model';
import { TASK_FREQUENCY_TYPES, TASK_TYPES } from './constants';
import * as moment from 'moment';
const DATE_FORMAT = "DD-MMMM-YYYY";

@Component({
    templateUrl: './tasks.html'
})
export class TasksComponent {
    tasks = new Array<Task>();
    currentTask: Task = {};
    taskTypes = TASK_TYPES;
    frequencyTypes = TASK_FREQUENCY_TYPES;
    moment = moment;

    constructor(
        private api: Api) {
        this.fetchTasks();
    }

    fetchTasks() {
        this.api.sendRequest({ endpoint: ApiRoutes.FETCH_ALL_TASKS, method: 'get' })
            .subscribe(res => {
                let tasks = res.json();
                (tasks as Task[]).forEach(t => {
                    t.customer = t.customer[0];
                    t.user = t.user[0];
                });
                this.tasks = tasks;
                this.sortTasksByNextDueDate()
            }
            ,
            err => console.log(err));
    }

    getFrequencyTypeText(frequencyValue) {
        return this.frequencyTypes.find((ft) => ft.value == frequencyValue).text;
    }

    getNextDueDate(task: Task) {
        if (task.completed) {
            return "Task Completed";
        }
        else {
            let startingDate: moment.Moment;
            let nextDueDate: moment.Moment;
            if (task.startsOn) {
                startingDate = moment(task.startsOn);
            }

            let today = moment();
            switch (task.frequency) {
                //if does not repeat
                case TASK_FREQUENCY_TYPES[0].value:
                    nextDueDate = startingDate;
                    break;
                //if repeats daily
                case TASK_FREQUENCY_TYPES[1].value:
                    //since the task repeats daily and is not completed yet, so today is the latest due date
                    nextDueDate = moment();
                    break;
                //if repeats every week
                case TASK_FREQUENCY_TYPES[2].value:
                    if (moment().diff(startingDate, "days") == 0) {
                        nextDueDate = moment();
                    }
                    else {
                        //dFSD = daysFromStartingDate
                        let daysFromStartingDate = moment().diff(startingDate, "days");
                        //add 1 weeks in starting date if today > startingDate && dFSD <=7
                        //add 2 """"""""""""""""""""""""" today > startingDate && dFSD > 7 && dFSD <= 14
                        nextDueDate = startingDate.add(Math.ceil(daysFromStartingDate / 7), "weeks");
                    }
                    break;
                //if repeats every month
                case TASK_FREQUENCY_TYPES[3].value:
                    if (moment().diff(startingDate, "days") == 0) {
                        nextDueDate = moment();
                    }
                    else {
                        //mFSD = monthsFromStartingDate
                        let monthsFromStartingDate = moment().diff(startingDate, "months");
                        //add mFSD + 1 months in starting Date
                        nextDueDate = startingDate.add(monthsFromStartingDate + 1, "months");
                    }
                    break;
                //if repeats every year
                case TASK_FREQUENCY_TYPES[4].value:
                    if (moment().diff(startingDate, "days") == 0) {
                        nextDueDate = moment();
                    }
                    else {
                        //yFSD = yearsFromStartingDate
                        let yearsFromStartingDate = moment().diff(startingDate, "years");
                        //add yFSD + 1 years in starting Date
                        nextDueDate = startingDate.add(yearsFromStartingDate + 1, "years");
                    }
                    break;
            }
            return nextDueDate;
        }
    }

    sortTasksByNextDueDate() {
        this.tasks.forEach(t => {
            t.nextDueDate = (this.getNextDueDate(t) as moment.Moment);
        })

        this.tasks.sort((a, b) => { return (a.nextDueDate as moment.Moment).diff((b.nextDueDate as moment.Moment)) });
    }


    setCurrentTask(task: Task) {
        this.currentTask = task
    }

    onTaskCreated(task: Task) {
        this.tasks.push(task);
        this.sortTasksByNextDueDate();
        this.currentTask = {};
    }

    onTaskUpdated(task: Task) {
        let taskIndex = this.tasks.findIndex((t: Task) => { return t.id == task.id });
        if (taskIndex >= 0) {
            this.tasks[taskIndex] = task;
            this.sortTasksByNextDueDate();
        }
        this.currentTask = {};
    }

    onTaskDeleted(task: Task) {
        let taskIndex = this.tasks.findIndex((t) => { return t.id == task.id });
        this.tasks.splice(taskIndex, 1);
    }
}