import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Task } from '../models/task';
import { UsersController } from './users';
import { TransactionsController } from "./transactions";
import { Transaction } from "../models/transaction";
import { CallType } from '../models/call-type';

const TASKS = "tasks";
class Completion {
    task: Task;
    completionInfo: { paymentStatus: number, paid: number, completed?: boolean }
};

const tempPayload = {
    "task": {
        "_id": "59c496393c63680b970d2d83",
        "description": "Payment request",
        "nextDueDate": "2017-09-22",
        "type": 2,
        "userName": "Vivek",
        "user": { "_id": "59c495c93c63680b970d2d82", "admin": 0, "name": "Vivek", "groupId": "17", "openingBalance": 0, "natureOfOB": "dr", "mobile": "9217690006", "address": "622 Basant Avenue", "password": "1234", "id": "1506055625398" },
        "customerName": "Rohit undefined",
        "customer": { "_id": "59b042420f8b720004219f1b", "name": "Rohit", "groupId": "16", "openingBalance": 10000, "natureOfOB": "dr", "id": "1504723522679", "debit": 0, "credit": 6000, "accountType": { "_id": "59a9431f6bf43b1d18122a68", "id": "1", "name": "Assets", "nature": "dr" }, "balance": 4000 },
        "assignedToId": "1506055625398",
        "customerId": "1504723522679",
        "id": "1506055737359"
    },
    "completionInfo": {
        "paymentStatus": 0,//0 AMC, 1 Under Warrenty, 2 Payable
        "amount": 500,
        "paid": 400,
        completed: true //if project
    }
}
export class TasksController {
    public static route: string = `/${TASKS}`;
    public router: Router = Router();
    //private db: Db;
    constructor(private db: Db) {
        this.router.get('/', this.fetchAll.bind(this));
        this.router.get('/:id', this.findOne.bind(this));
        this.router.post('/:id/completed', this.completeTask.bind(this));
        this.router.post('/', this.createTask.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.deleteTask.bind(this));
    }

    fetchAll(req: Request, res: Response) {
        let $this = this;
        let filterByDueDate = req.query.dueDate ? [{ $match: { nextDueDate: req.query.dueDate } }] : [];
        let filterCompletedTasks = filterByDueDate.length > 0 ? [] : [{ $match: { completed: undefined } }];
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
        task.id = (new Date()).valueOf().toString();
        this.db
            .collection(TASKS)
            .insertOne(task)
            .then((response: InsertOneWriteOpResult) => {
                res.send(task);
            }).catch(err => {
                res.status(400).send(err);
            })
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
            .then(deleteResult => res.send())
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

        if (task.type == 0 || task.type == 2) {
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
                    transaction.amount = extra.paymentStatus < 2 ? 0 : task.amount;
                    transaction.creditAccountId = salesAccount.id;
                    transaction.date = new Date();
                    transaction.dateString = `${transaction.date.getFullYear()}-${padStart((transaction.date.getMonth() + 1).toString(), 2, "0")}-${padStart((transaction.date.getDate()).toString(), 2, "0")}`
                    transaction.debitAccountId = completion.task.customerId
                    transaction.narration = this.getNarration(task, completion.completionInfo);
                    transactionsController.addTransaction(transaction).then(() => {
                        if(task.type == CallType.Payment || extra.paymentStatus == 2){
                            transaction.date = new Date();
                            transaction.dateString = `${transaction.date.getFullYear()}-${padStart((transaction.date.getMonth() + 1).toString(), 2, "0")}-${padStart((transaction.date.getDate()).toString(), 2, "0")}`
                            transaction.debitAccountId = task.user.id;
                            transaction.creditAccountId = task.customer.id
                            transaction.amount = extra.paid;
                            delete transaction._id;
                            transactionsController.addTransaction(transaction).then(() => {
                                this.completeTaskByMarkingItCompleted(task, extra, res);
                            }).catch((err) => {
                                res.status(500).send(err);
                            })
                        }
                        else{
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
        else {
            this.completeTaskByMarkingItCompleted(task, extra, res)
        }

    }

    completeTaskByMarkingItCompleted(task, extra, res) {
        task.completed = task.type == 3 ? extra.completed : true;
        delete task.user;
        delete task.customer;

        this.updateTask(task).then(() => {
            res.status(200).send({message:"Task Completed"});
        }).catch((err) => { res.status(500).send(err) });
    }

    getNarration(task: Task, extra: { paymentStatus: number, paid: number, completed?: boolean }) {
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
        let narration = ` "${task.user.name}" visited "${task.customer.name}" for "${taskType}" narrated as "${task.description}"`;
        if (task.type == CallType.COMPLAINT && extra.paymentStatus < 2) {
            narration += `which was under ${extra.paymentStatus == 0 ? "AMC" : "Warrenty"}`;
        }
        else if ((task.type == CallType.COMPLAINT && extra.paymentStatus == 2) || task.type == CallType.Payment) {
            narration += `Total Amount Due was ${task.amount} rs of which ${extra.paid} rs were paid`;
        }
        return narration;
    }
}

const padStart = (string, maxLength, fillString) => {

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