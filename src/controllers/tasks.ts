import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Task } from '../models/task';

const TASKS = "tasks";
export class TasksController {
    public static route: string = `/${TASKS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.get('/', this.fetchAll.bind(this));
        this.router.get('/:id', this.findOne.bind(this));
        this.router.post('/', this.createTask.bind(this));
        this.router.put('/:id', this.updateTask.bind(this));
        this.router.delete('/:id',this.deleteTask.bind(this))

    }

    fetchAll(req:Request,res:Response){
        this.db.collection(TASKS)
        .find().toArray()
        .then(
            (tasks:Task[])=>{
                res.send(tasks);
            },
            err=>{
                res.status(400).send(err);
            }
        );
    }

    findOne(req:Request,res:Response){
        this.db
            .collection(TASKS)
            .findOne({ _id: new ObjectID(req.params.id) })
            .then((task: Task) => {
                res.status(200).send(task);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    createTask(req:Request,res:Response){
        this.db
            .collection(TASKS)
            .insertOne(req.body)
            .then((response: InsertOneWriteOpResult) => {
                res.send(response.insertedId);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    updateTask(req: Request, res: Response) {
        delete req.body._id;
        this.db.collection(TASKS)
            .updateOne({ _id: new ObjectID(req.params.id) }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    deleteTask(req: Request, res: Response){
         this.db.collection(TASKS).deleteOne({_id:new ObjectID(req.params.id)})
        .then(deleteResult=>res.send())
        .catch(error=>res.status(400).send(error));
    }
}
