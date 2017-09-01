import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Account } from '../models/account';
import { Group } from './../models/group';
import { AccountType } from '../models/account-type';
const ACCOUNTS = "accounts";
const GROUPS = "groups";

export class AccountsController {
    public static route: string = `/${ACCOUNTS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.delete.bind(this))
    }

    private get(req: Request, res: Response) {
        this.db
            .collection(ACCOUNTS)
            .find().toArray()
            .then((accounts: Account[]) => {
                res.status(200).send(accounts);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private getById(req: Request, res: Response) {
        this.db
            .collection(ACCOUNTS)
            .findOne({ id: req.params.id })
            .then((account: Account) => {
                res.status(200).send(account);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private post(req: Request, res: Response) {
        req.body.id = (new Date()).valueOf().toString();
        this.db
            .collection(ACCOUNTS)
            .insertOne(req.body)
            .then((accnt: InsertOneWriteOpResult) => {
                res.send(req.body.id);
            }).catch(err => {
                res.status(400).send(err);
            })
    }
    


    private put(req: Request, res: Response) {
        delete req.body._id;
        this.db.collection(ACCOUNTS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    private delete(req: Request, res: Response) {
        this.db.collection(ACCOUNTS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }
}