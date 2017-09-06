"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ACCOUNTS = "accounts";
const GROUPS = "groups";
class AccountsController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }
    get(req, res) {
        let filter = req.query.hasOwnProperty('groupId') ? { groupId: req.query.groupId } : {};
        this.db
            .collection(ACCOUNTS)
            .aggregate([
            {
                $match: filter
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
        ]).toArray()
            .then((accounts) => {
            res.status(200).send(accounts);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    getById(req, res) {
        this.db
            .collection(ACCOUNTS)
            .findOne({ id: req.params.id })
            .then((account) => {
            res.status(200).send(account);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    post(req, res) {
        req.body.id = (new Date()).valueOf().toString();
        this.db
            .collection(ACCOUNTS)
            .insertOne(req.body)
            .then((accnt) => {
            res.send(req.body.id);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    put(req, res) {
        delete req.body._id;
        this.db.collection(ACCOUNTS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
            res.send(data);
        })
            .catch((err) => {
            res.status(400).send(err);
        });
    }
    delete(req, res) {
        this.db.collection(ACCOUNTS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }
}
AccountsController.route = `/${ACCOUNTS}`;
exports.AccountsController = AccountsController;
