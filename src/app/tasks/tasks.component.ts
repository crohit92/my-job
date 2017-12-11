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
import { CallType } from '../models/task-type.model';
import { PaymentStatus } from '../models/payment-status';
import { ProjectParameter } from '../models/project-parameter';
const DATE_FORMAT = "DD-MMMM-YYYY";

@Component({
    templateUrl: './tasks.html'
})
export class TasksComponent {
    tasks = new Array<Task>();
    currentTaskToComplete: Task = {};
    taskToUpdate: Task = {};
    user: User;
    filterTask: string;
    taskTypes = TASK_TYPES;
    moment = moment;
    public modalRef: BsModalRef;
    openPaneIndex = 0;
    completionInfo: any = {};
    callType = CallType;
    paymentStatus = PaymentStatus;
    projectParameters: ProjectParameter[];
    dueDate: string;

    @ViewChild("template") template: TemplateRef<any>;
    @ViewChild("templateCompleteTask") templateCompleteTask: TemplateRef<any>;

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

        //fetch parameters for project
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_PROJECT_PARAMETERS,
            method: "get"
        }).subscribe((parameters: ProjectParameter[]) => {
            this.projectParameters = parameters;
        })

    }

    fetchTasks() {
        this.api.sendRequest({
            endpoint: ApiRoutes.FETCH_ALL_TASKS,
            method: 'get',
            queryParams: { ...(this.dueDate ? { dueDate: this.dueDate } : {}), ...(this.user.admin == 0 ? { userId: this.user.id } : {}) }
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

    openModal(task: Task = undefined) {
        // *ngIf="user.admin>0"
        // *ngIf="user.admin==0"
        if (this.user.admin > 0) {
            this.editTask(task);
        }
        else {
            this.completeTask(task);
        }

    }

    editTask(task: Task) {
        this.taskToUpdate = task ? { ...task } : {};
        this.modalRef = this.modalService.show(this.template);
    }

    completeTask(task) {
        //hide the modal if already open
        this.modalRef ? this.modalRef.hide() : undefined;
        this.currentTaskToComplete = { ...task };
        //If the task is not complete yet, then add the initial parameters 
        //with default values
        if (!this.currentTaskToComplete.completed) {
            this.currentTaskToComplete.parameters = [];
            if (this.projectParameters) {
                this.currentTaskToComplete.parameters = [...this.projectParameters];
            }
        }
        if (this.user.admin && this.currentTaskToComplete.completed) {
            //since user wants all information, so we nned to fill up the 
            //the next due date aswell
            this.completionInfo.nextDueDate = this.currentTaskToComplete.nextDueDate;
        }

        this.modalRef = this.modalService.show(this.templateCompleteTask);
    }

    sortTasksByNextDueDate() {
        let $this = this;
        this.tasks.sort((a, b) => {
            let diff = (moment(a.nextDueDate) as moment.Moment).diff((moment(b.nextDueDate) as moment.Moment));
            if (diff == 0) {
                return a.sequence - b.sequence;
            }
            else {
                return diff
            }
        });
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
                try {
                    this.sortTasksByNextDueDate();
                } catch (error) {

                }

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

    taskCompleted(task: Task, completionInfo: any) {
        let routeParams = {};
        routeParams[task.id] = "completed";
        this.api.sendRequest({
            endpoint: ApiRoutes.COMPLETE_TASK,
            routeParams: routeParams,
            method: 'post',
            body: {
                task: task,
                completionInfo: completionInfo
            }
        }).subscribe(taskCompleted => {
            this.modalRef.hide();
            this.completionInfo = {};
            this.fetchTasks();
        })
    }

}
