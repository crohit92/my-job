import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Task } from '../models/task';
import { UsersController } from './users';
import { TransactionsController } from "./transactions";
import { Transaction } from "../models/transaction";
import { CallType } from '../models/call-type';
import { PaymentStatus } from '../models/payment-status';
const PROJECT_PROPERTIES = "projectProperties";
const TASKS = "tasks";
class Completion {
    task: Task;
    completionInfo: { paymentStatus: number, paid: number, discountAmount: number }
};

export class TasksController {
    public static route: string = `/${TASKS}`;
    public router: Router = Router();
    //private db: Db;
    constructor(private db: Db) {
        this.router.get("/projectParameters", this.getProjectParameters.bind(this));
        this.router.get('/', this.fetchAll.bind(this));
        this.router.get('/:id', this.findOne.bind(this));
        this.router.post('/:id/completed', this.completeTask.bind(this));
        this.router.post('/', this.createTask.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.deleteTask.bind(this));
    }

    getProjectParameters(req: Request, res: Response) {
        this.db.collection(PROJECT_PROPERTIES).find().toArray().then((data) => {
            res.send(data);
        }).catch((err) => res.status(500).send(err));
    }

    fetchAll(req: Request, res: Response) {
        let $this = this;
        let filterByDueDate = req.query.dueDate ? [{ $match: { nextDueDate: req.query.dueDate } }] : [];
        let filterCompletedTasks = filterByDueDate.length > 0 ? [] : [{ $match: { $or: [{ completed: undefined }, { completed: false }] } }];
        let filterByUser = req.query.userId ? [{ $match: { assignedToId: req.query.userId } }] : [];

        this.db.collection(TASKS).aggregate(
            [].concat(
                ...filterByUser,
                ...filterByDueDate,
                ...filterCompletedTasks,
                this.includeUserAndCustomer(), )
        )
            .toArray()
            .then((tasks: Task[]) => {
                res.send(tasks);
            })
            .catch((err) =>
                res.status(400).send(err)
            );
    }


    findOne(req: Request, res: Response) {
        let $this = this;

        this.db.collection(TASKS).aggregate(
            [].concat(
                {
                    $match: {
                        id: req.params.id
                    }
                },
                this.includeUserAndCustomer()
            )
        ).next().then((task: Task) => {
            res.status(200).send(task);
        }).catch(err => {
            res.status(400).send(err);
        })
    }

    createTask(req: Request, res: Response) {
        let task: Task = req.body;

        this._createTask(task).then((response: InsertOneWriteOpResult) => {
            res.send(task);
        }).catch(err => {
            res.status(400).send(err);
        })
    }

    private _createTask(task: Task) {
        task.id = (new Date()).valueOf().toString();
        return this.db
            .collection(TASKS)
            .insertOne(task)
    }

    private updateTask(task) {
        return this.db.collection(TASKS).updateOne({
            id: task.id
        },
            {
                $set: task
            })
    }
    put(req: Request, res: Response) {
        delete req.body._id;
        let task: Task = req.body;

        this.updateTask(task).then((data) => {
            res.send(task);
        })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    deleteTask(req: Request, res: Response) {
        this.db.collection(TASKS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send({ deleted: true }))
            .catch(error => res.status(400).send(error));
    }

    includeUserAndCustomer(): Object[] {
        return [
            {
                $lookup: {
                    from: "accounts",
                    localField: "assignedToId",
                    foreignField: "id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "customerId",
                    foreignField: "id",
                    as: "customer"
                }
            }
        ]
    }

    completeTask(req: Request, res: Response) {
        delete req.body.task._id;
        let completion = req.body as Completion;
        /*
        task type 0->Complaint, 1->Query, 2->Payment, 3->Project
        payment status 0->AMC, 1->Warrenty, 2-> Payable
        
        completion info{ 
            paymentStatus: boolean, 
            paid: number, 
            completed?: boolean 
        }
        
        1. task type(0) & payment status(0|1|2)
        a. Customer to Services by amount(0 if payment status = 0|1)
        b. if payment status(2)
        User to Customer by paid
        2. task type(2)
        User to Customer by paid
        */
        let task = completion.task;
        let extra = completion.completionInfo;

        if (task.type == CallType.COMPLAINT) {
            this.db.collection("accounts").findOne({
                groupId: '14'
            }).then((salesAccount: Account) => {
                if (!salesAccount) {
                    res.status(500).send({ message: "No Account has been created under sales group" });
                    return;
                }
                else {
                    let transactionsController = new TransactionsController(this.db);
                    let transaction: Transaction = new Transaction();
                    transaction.amount = extra.paymentStatus != PaymentStatus.PAYABLE ? 0 : task.amount;
                    transaction.creditAccountId = salesAccount.id;
                    var today = new Date();
                    transaction.dateString = `${today.getFullYear()}-${padStart((today.getMonth() + 1).toString(), 2, "0")}-${padStart((today.getDate()).toString(), 2, "0")}`
                    transaction.date = transaction.dateString;
                    transaction.debitAccountId = completion.task.customerId
                    transaction.narration = this.getNarration(task, completion.completionInfo);
                    transactionsController.addTransaction(transaction).then(() => {
                        //if payment was not covered under AMC or warrenty
                        if (extra.paymentStatus == PaymentStatus.PAYABLE) {
                            this.savePaymentReceivedByUser(task, completion, res)
                        }
                        else {
                            this.completeTaskByMarkingItCompleted(task, extra, res);
                        }

                    }).catch((err) => {
                        res.status(500).send(err);
                    })

                }
            }).catch((err) => {
                res.status(500).send(err);
            });
        }
        else if (task.type == CallType.Payment) {
            this.savePaymentReceivedByUser(task, completion, res)
        }
        else {
            this.completeTaskByMarkingItCompleted(task, extra, res)
        }

    }

    private savePaymentReceivedByUser(task: Task, completion: Completion, res: Response) {
        this.db.collection("accounts").findOne({
            groupId: '19'
        }).then((discountAccount: Account) => {
            let transactionsController = new TransactionsController(this.db);
            var today = new Date();
            let transaction: Transaction = new Transaction();
            transaction.narration = this.getNarration(task, completion.completionInfo);
            transaction.dateString = `${today.getFullYear()}-${padStart((today.getMonth() + 1).toString(), 2, "0")}-${padStart((today.getDate()).toString(), 2, "0")}`
            transaction.date = transaction.dateString;
            transaction.debitAccountId = task.user.id;
            transaction.creditAccountId = task.customer.id
            transaction.amount = completion.completionInfo.paid;
            transactionsController.addTransaction(transaction).then(() => {
                //if discount ammount is greater than 0
                //then add n new transaction for discount
                if (completion.completionInfo.discountAmount) {
                    let discountTransaction = { ...transaction };
                    delete discountTransaction._id;
                    discountTransaction.amount = completion.completionInfo.discountAmount;
                    discountTransaction.debitAccountId = discountAccount.id;
                    transactionsController.addTransaction(discountTransaction).then(() => {
                        this.completeTaskByMarkingItCompleted(task, completion.completionInfo, res);
                    }).catch((err) => {
                        res.status(500).send({ err: err, message: "Error Here" });
                    })
                }
                else {
                    this.completeTaskByMarkingItCompleted(task, completion.completionInfo, res);
                }

            }).catch((err) => {
                res.status(500).send(err);
            })
        }).catch((err) => {
            res.status(500).send({ message: "No Account exists under group Discounts and losses" });
        })
    }

    completeTaskByMarkingItCompleted(task: Task, extra, res) {
        task.completed = true;
        //task.assignedToId = task.type == 3 ? undefined : task.assignedToId;
        //task.userName = undefined;
        delete task.user;
        delete task.customer;

        this.updateTask(task).then(() => {
            if (task.type == CallType.Project) {
                let newTask: Task = { ...{}, ...task };
                newTask.assignedToId = undefined;
                newTask.userName = undefined;
                newTask.completed = false;
                newTask.id = (new Date()).valueOf().toString();
                newTask.nextDueDate = extra.nextDueDate;
                newTask.remarks = '';
                this._createTask(newTask).then((response) => {
                    res.status(200).send({ message: "Task Completed" });
                }).catch(err => res.status(500).send(err));
            }
            else {
                res.status(200).send({ message: "Task Completed" });
            }

        }).catch((err) => { res.status(500).send(err) });
    }

    getNarration(task: Task, extra: { paymentStatus: number, paid: number, discountAmount: number }) {
        /*
        task type 0->Complaint, 1->Query, 2->Payment, 3->Project
        payment status 0->AMC, 1->Warrenty, 2-> Payable
        
        completion info{ 
            paymentStatus: boolean, 
            
            paid: number, 
            completed?: boolean 
        }
        
        narration: <User> visited <Customer> for <Task.Type> narrated as <task.description>,
        1. task type(0) & payment status(0|1)
        narration: which was under < payment status>
        
        2. [task type(0) & payment status(2)] | [task type(2)]
        narration: Total Amount Due was <amount>rs of which <paid>rs were paid
        
        */


        let taskType = task.type == CallType.COMPLAINT ? "Complaint" : "Payment";
        let narration = ` ${task.user.name} visited ${task.customer.name} for ${taskType} narrated as ${task.description} \n`;
        if (task.type == CallType.COMPLAINT && extra.paymentStatus != PaymentStatus.PAYABLE) {
            narration += ` which was ` +
                (extra.paymentStatus != PaymentStatus.NONPAYABLE ? (` under ${extra.paymentStatus == PaymentStatus.AMC ? "AMC" : "Warrenty"}`) :
                    `non payable`);
        }
        else if ((task.type == CallType.COMPLAINT && extra.paymentStatus == PaymentStatus.PAYABLE) || task.type == CallType.Payment) {
            narration += ` Total Amount Due was ${task.amount} rs of which ${extra.paid} rs were paid \n`;
            if (extra.discountAmount) {
                narration += ` discount of ${extra.discountAmount} rs was allowed`;
            }
        }
        return narration;
    }
}

export const padStart = (string, maxLength, fillString) => {

    if (string == null || maxLength == null) {
        return string;
    }

    var result = String(string);
    var targetLen = typeof maxLength === 'number'
        ? maxLength
        : parseInt(maxLength, 10);

    if (isNaN(targetLen) || !isFinite(targetLen)) {
        return result;
    }


    var length = result.length;
    if (length >= targetLen) {
        return result;
    }


    var fill = fillString == null ? '' : String(fillString);
    if (fill === '') {
        fill = ' ';
    }


    var fillLen = targetLen - length;

    while (fill.length < fillLen) {
        fill += fill;
    }

    var truncated = fill.length > fillLen ? fill.substr(0, fillLen) : fill;

    return truncated + result;
};