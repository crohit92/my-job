import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';
import { Task } from '../models/task.model';
import { TASK_TYPES } from './constants';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { User } from "../models/user.model";
import { Account } from "../models/account.model";
import { ToastrService } from "ngx-toastr";
import { Utils, UserType } from "../helper/utils";
import { StorageService } from "../helper/storage.service";
import { Constants } from "../helper/constants";
const DATE_FORMAT = "DD-MMMM-YYYY";

@Component({
    templateUrl: './tasks.html'
})
export class TasksComponent {
    tasks = new Array<Task>();
    currentTask: Task = {};
    user: User;
    users: Account[];
    customers: Account[];
    filterTask: string;
    taskTypes = TASK_TYPES;
    moment = moment;
    public modalRef: BsModalRef;
    openPaneIndex = 0;
    completionInfo:any = {};
    @ViewChild("template") template: TemplateRef<any>;
    @ViewChild("templateCompleteTask") templateCompleteTask:TemplateRef<any>;

    constructor(
        private api: Api,
        private modalService: BsModalService,
        private alert: ToastrService,
        private utils: Utils,
        private storage: StorageService
    ) {
        this.utils.showMenu(true);
        this.user = this.storage.get(Constants.USER);
        this.fetchTasks();

        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_USERS,
            method: "get"
        }).subscribe((res => this.users = (res as Account[])))

        //fetch customers
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_CUSTOMERS,
            method: "get"
        }).subscribe((res => this.customers = (res as Account[]).map(c => {
            c.name_mobile = c.name + " " + c.mobile
            return c;
        })))

    }

    fetchTasks() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_TASKS,
            method: 'get',
            queryParams: this.user.admin == 0 ? {
                userId: this.user.id
            } : {}
        })
            .subscribe(res => {
                let tasks = res as Task[];
                (tasks as Task[]).forEach(t => {
                    t.customer = t.customer[0];
                    t.user = t.user[0];
                });
                this.tasks = tasks;
                this.sortTasksByNextDueDate()
            }, err => console.log(err));
    }

    openModal(task: Task) {
        this.currentTask = task ? { ...task } : {};
        this.modalRef = this.modalService.show(this.template);
    }

    completeTask(task){
        this.currentTask = { ...task };
        this.modalRef = this.modalService.show(this.templateCompleteTask);
    }
    sortTasksByNextDueDate() {
        let $this = this;
        this.tasks.sort((a, b) => { return (moment(a.nextDueDate) as moment.Moment).diff((moment(b.nextDueDate) as moment.Moment)) });
    }

    matchById(obj1, obj2) {
        return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
    }

    createOrUpdateTask(task: Task) {

        if (task.user)
            task.assignedToId = task.user.id;
        else {
            task.assignedToId = null;
        }
        if (task.customer)
            task.customerId = task.customer.id;
        else {
            task.customerId = null;
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
            body: task,
            endpoint: ApiRoutes.CREATE_TASK,
            method: 'post'
        }).subscribe(
            res => {
                this.modalRef.hide();
                this.tasks.push(res)
                this.sortTasksByNextDueDate();
            },
            err =>
                this.alert.error("An Error Occured", "Error")
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
            res => {
                this.modalRef.hide();
                let taskIndex = this.tasks.findIndex(t => t.id == task.id);
                if (taskIndex != -1) {
                    this.tasks[taskIndex] = { ...res } as Task;
                    this.sortTasksByNextDueDate();
                }
            },
            err => this.alert.error("An Error Occured", "Error"))
    }

    deleteTask(task: Task) {
        this.api.sendRequest({
            endpoint: ApiRoutes.DELETE_TASK,
            method: 'delete',
            routeParams: {
                '': task.id
            }
        }).subscribe(() => {
            this.tasks = this.tasks.filter(t => t.id != task.id);
            this.modalRef.hide();
        })
    }

    taskCompleted(task:Task,completionInfo:any){
        let routeParams = {};
        routeParams[task.id]="completed";
        this.api.sendRequest({
            endpoint:ApiRoutes.COMPLETE_TASK,
            routeParams:routeParams,
            method:'post',
            body:{
                task:task,
                completionInfo:completionInfo
            }
        }).subscribe(taskCompleted=>{
            
        })
    }
    // setCurrentTask(task: Task) {
    //     this.currentTask = task
    // }

    // onTaskCreated(task: Task) {
    //     this.tasks.push(task);
    //     this.sortTasksByNextDueDate();
    //     this.currentTask = {};
    // }

    // onTaskUpdated(task: Task) {
    //     let taskIndex = this.tasks.findIndex((t: Task) => { return t.id == task.id });
    //     if (taskIndex >= 0) {
    //         this.tasks[taskIndex] = task;
    //         this.sortTasksByNextDueDate();
    //     }
    //     this.currentTask = {};
    // }

    // onTaskDeleted(task: Task) {
    //     let taskIndex = this.tasks.findIndex((t) => { return t.id == task.id });
    //     this.tasks.splice(taskIndex, 1);
    // }
}

    //getNextDueDate(task: Task) {
    //     if (task.completed) {
    //         return "Task Completed";
    //     }
    //     else {
    //         let startingDate: moment.Moment;
    //         let nextDueDate: moment.Moment;
    //         if (task.startsOn) {
    //             startingDate = moment(task.startsOn);
    //         }

    //         let today = moment();
    //         switch (task.frequency) {
    //             //if does not repeat
    //             case TASK_FREQUENCY_TYPES[0].value:
    //                 nextDueDate = startingDate;
    //                 break;
    //             //if repeats daily
    //             case TASK_FREQUENCY_TYPES[1].value:
    //                 //since the task repeats daily and is not completed yet, so today is the latest due date
    //                 nextDueDate = moment();
    //                 break;
    //             //if repeats every week
    //             case TASK_FREQUENCY_TYPES[2].value:
    //                 if (moment().diff(startingDate, "days") == 0) {
    //                     nextDueDate = moment();
    //                 }
    //                 else {
    //                     //dFSD = daysFromStartingDate
    //                     let daysFromStartingDate = moment().diff(startingDate, "days");
    //                     //add 1 weeks in starting date if today > startingDate && dFSD <=7
    //                     //add 2 """"""""""""""""""""""""" today > startingDate && dFSD > 7 && dFSD <= 14
    //                     nextDueDate = startingDate.add(Math.ceil(daysFromStartingDate / 7), "weeks");
    //                 }
    //                 break;
    //             //if repeats every month
    //             case TASK_FREQUENCY_TYPES[3].value:
    //                 if (moment().diff(startingDate, "days") == 0) {
    //                     nextDueDate = moment();
    //                 }
    //                 else {
    //                     //mFSD = monthsFromStartingDate
    //                     let monthsFromStartingDate = moment().diff(startingDate, "months");
    //                     //add mFSD + 1 months in starting Date
    //                     nextDueDate = startingDate.add(monthsFromStartingDate + 1, "months");
    //                 }
    //                 break;
    //             //if repeats every year
    //             case TASK_FREQUENCY_TYPES[4].value:
    //                 if (moment().diff(startingDate, "days") == 0) {
    //                     nextDueDate = moment();
    //                 }
    //                 else {
    //                     //yFSD = yearsFromStartingDate
    //                     let yearsFromStartingDate = moment().diff(startingDate, "years");
    //                     //add yFSD + 1 years in starting Date
    //                     nextDueDate = startingDate.add(yearsFromStartingDate + 1, "years");
    //                 }
    //                 break;
    //         }
    //         return nextDueDate;
    //     }
    // }

    // getFrequencyTypeText(frequencyValue) {
    //    return this.frequencyTypes.find((ft) => ft.value == frequencyValue).text;
    //}