import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Task } from '../models/task';
import { UsersController } from './users';
import { TransactionsController } from "./transactions";
import { Transaction } from "../models/transaction";

const TASKS = "tasks";
class Completion {
    task: Task;
    completionInfo: { amc: boolean, amount: number, paid: boolean, completed?: boolean }
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
        "amc": true,
        "amount": 500,
        "paid": true,
        completed: true
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
        let fetchIncompleteTasks = { completed: undefined };
        let filterByUser = req.query.userId ? [{ $match: { ...fetchIncompleteTasks, ...{ assignedToId: req.query.userId } } }] : [{ $match: { ...fetchIncompleteTasks } }];

        this.db.collection(TASKS).aggregate(
            [].concat(this.includeUserAndCustomer(), ...filterByUser)
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
        1. All tasks need to be entered into the journal since we want to keep track of all activities
        2. For all tasks completed 
        2.1. Customer   dr. to Services cr.
        2.2. If amount > 0 and paid == true then User    dr. to Customer  cr.
        3 If task.type !== 3 ie project then 3.1 else 3.2
        3.1. Update task set completed to true
        3.2. If completionInfo.taskType == 3
        3.2.1 Update task-> set nextDueDate and completed
        */
        let transactionsController = new TransactionsController(this.db);
        let transaction: Transaction = new Transaction();
        let task = completion.task;
        let extra = completion.completionInfo;
        transaction.amount = completion.completionInfo.amount || 0;
        this.db.collection("accounts").findOne({
            groupId: '14'
        }).then((account: Account) => {
            if (!account) {
                res.status(500).send({ message: "No Account has been created under sales group" });
                return;
            }
            else {
                transaction.creditAccountId = account.id;
                transaction.date = new Date();
                transaction.debitAccountId = completion.task.customerId
                transaction.narration = this.getNarration(task, completion.completionInfo);

                transactionsController.addTransaction(transaction).then(() => {

                    //first transaction has been made
                    if (extra.amount > 0 && extra.paid) {
                        transaction.date = new Date();
                        transaction.debitAccountId = task.user.id;
                        transaction.creditAccountId = task.customer.id
                        delete transaction._id;
                        transactionsController.addTransaction(transaction).then(() => {
                            this.completeTaskByMarkingItCompleted(task, extra, res);
                        }).catch((err) => {
                            res.status(500).send(err);
                        })
                    }
                    else {
                        this.completeTaskByMarkingItCompleted(task, extra, res)
                    }

                }).catch((err) => {
                    res.status(500).send(err);
                })
            }
        })


    }

    completeTaskByMarkingItCompleted(task, extra, res) {
        task.completed = task.type == 3 ? extra.completed : true;
        delete task.user;
        delete task.customer;

        this.updateTask(task).then(() => {
            res.status(200).send();
        }).catch((err) => { res.status(500).send(err) });
    }

    getNarration(task: Task, extra: { amc: boolean, paid: boolean, amount: number, completed?: boolean }) {
        extra.amount = extra.amount == undefined ? 0 : extra.amount;
        let narration = ` "${task.user.name}" visited "${task.customer.name}" for "${task.description}"`;
        if (extra.amount > 0 && extra.paid) {
            narration += ` "${task.customer.name}" paid "${extra.amount}" rs`;
        }
        else if (extra.amount > 0 && !extra.paid) {
            narration += ` "${extra.amount}" was asked for but was not paid`;
        }
        if (extra.amc) {
            narration += ` Visit was covered under AMC`
        }
        if(task.type == 3 && extra.completed){
            narration+= ` Project is complete`;
        }
        else if(task.type == 3){
            narration += ` Next visit Due on "${task.nextDueDate}"`;
        }
        
        return narration;
    }
}
