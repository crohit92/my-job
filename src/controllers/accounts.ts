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
        this.router.post('/login', this.login.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.delete.bind(this))
    }

    private get(req: Request, res: Response) {

        let filter = req.query.hasOwnProperty('groupId') ? { groupId: req.query.groupId } : {};
        let pagination = [];
        if (req.query.hasOwnProperty('skip') && req.query.hasOwnProperty('limit')) {
            pagination.push({ $skip: (+req.query.skip) })
            pagination.push({ $limit: (+req.query.limit) })
        }


        this.db
            .collection(ACCOUNTS)
            .aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'groups',
                        localField: 'groupId',
                        foreignField: 'id',
                        as: 'group'
                    }
                },
                ...pagination
            ]).toArray()
            .then((accounts: Account[]) => {
                res.status(200).send(accounts);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private getById(req: Request, res: Response) {
        this.db
            .collection(ACCOUNTS)
            .aggregate([
                {
                    $match: {
                        id: req.params.id
                    }
                },
                {
                    $lookup: {
                        from: 'groups',
                        localField: 'groupId',
                        foreignField: 'id',
                        as: 'group'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        localField: 'id',
                        foreignField: 'debitAccountId',
                        as: 'debits'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        localField: 'id',
                        foreignField: 'creditAccountId',
                        as: 'credits'
                    }
                },
                {
                    $unwind: { path: '$debits', preserveNullAndEmptyArrays: true }
                },
                {
                    $unwind: { path: '$credits', preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        id: '$id',
                        openingBalance: '$openingBalance',
                        natureOfOB: '$natureOfOB',
                        name: '$name',
                        groupId: '$groupId',
                        group: {
                            $arrayElemAt: ['$group', 0]
                        },
                        debits: '$debits',
                        credits: '$credits',
                    }
                },
                {
                    $group: {
                        _id: '$id',
                        id: { $first: '$id' },
                        name: { $first: '$name' },
                        group: { $first: '$group' },
                        openingBalance: { $first: '$openingBalance' },
                        natureOfOB: { $first: '$natureOfOB' },
                        groupId: { $first: '$groupId' },
                        debit: {
                            $sum: '$debits.amount'
                        },
                        credit: {
                            $sum: '$credits.amount'
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'accountTypes',
                        localField: 'group.accountTypeId',
                        foreignField: 'id',
                        as: 'accountType'
                    }
                },
                {
                    $project: {
                        id: '$id',
                        openingBalance: '$openingBalance',
                        natureOfOB: '$natureOfOB',
                        name: '$name',
                        groupId: '$groupId',
                        debit: '$debit',
                        credit: '$credit',
                        accountType: {
                            $arrayElemAt: ['$accountType', 0]
                        }
                    }
                }
            ]).next().then((account: Account) => {
                res.status(200).send(account);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private post(req: Request, res: Response) {
        req.body.id = (new Date()).valueOf().toString();
        let account = req.body;
        //check if account is a user account
        if (account.groupId == '17') {
            this.db.collection(ACCOUNTS).findOne({
                groupId: '17',
                mobile: account.mobile
            }).then(account => {
                if (account) {
                    res.status(403).send({ message: "User with this mobile number already exists" });
                    return;
                }
            })
        }

        this.db
            .collection(ACCOUNTS)
            .insertOne(req.body)
            .then((accnt: InsertOneWriteOpResult) => {
                res.send(account);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private login(req: Request, res: Response) {
        this.db.collection(ACCOUNTS).findOne({
            $and: [{
                $or: [{
                    mobile:
                    { $eq: req.body.mobile.toLowerCase() }
                }]
            },
            {
                password: { $eq: req.body.password }
            }
            ]
        }).then(user => {
            if (user) {
                res.send(user)
            }
            else {
                res.status(403).send();
            }
        }).catch(err => res.status(500).send(err));
    }

    private put(req: Request, res: Response) {
        delete req.body._id;
        if(req.body.groupId == '17' && req.body.admin != 2) {
            this.db.collection(ACCOUNTS).find({
                groupId:'17',
                admin:2
            }).toArray().then((accounts:Account[]) => {
                if(accounts.length == 1 && accounts[0].id == req.body.id){
                    res.status(403).send({ message: "Cannot delete all super admins" });
                    return;
                } 
            })
        }
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