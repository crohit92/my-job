import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Account } from '../models/account';
import { Group } from './../models/group';
import { AccountType } from '../models/account-type';
const ACCOUNTS = "accounts";
const GROUPS = "groups";
export class GroupsController {
    public static route: string = `/${GROUPS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.get('/', this.get.bind(this));
        this.router.get('/:id/accounts', this.getAccountsByGroupId.bind(this));
        this.router.post('/multiple', this.postMultiple.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
    }

    private get(req: Request, res: Response) {
        this.db.collection(GROUPS).find().toArray()
            .then((groups => { res.send(groups) }))
            .catch(err => res.status(500).send(err));
    }

    private getAccountsByGroupId(req: Request, res: Response) {
        this.db.collection(ACCOUNTS).find({
            groupId: req.params.id
        }).toArray()
            .then((accounts => { res.send(accounts) }))
            .catch(err => res.status(500).send(err));
    }

    private postMultiple(req: Request, res: Response) {
        let groups = req.body as Group[];
        //Groups in the system are fixed so the ids will explicitly
        //be passed along the create request
        // for (let index = 0; index < groups.length; index++) {
        //     groups[index].id = (new Date()).valueOf().toString();
        // }

        this.db.collection(GROUPS).insertMany(groups)
            .then(() => res.send(groups))
            .catch((err) => res.status(500).send(err));
    }

    private post(req: Request, res: Response) {
        let group = req.body;
        this.db.collection(GROUPS).insertOne(group)
        .then(() => { res.send(group) })
        .catch(err => res.status(500).send(err));
    }

    private put(req:Request,res:Response){
        let group = req.body;
        delete group._id;
        this.db.collection(GROUPS)
        .updateOne({ id:req.params.id }, { $set:group })
        .then(() => { res.send(group) })
        .catch(err => res.status(500).send(err));
    }

    

    


}