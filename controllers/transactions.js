"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TRANSACTIONS = "transactions";
class TransactionsController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.get.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
    }
    get(req, res) {
        let pagination = [];
        if (req.query.hasOwnProperty('skip') && req.query.hasOwnProperty('limit')) {
            pagination.push({ $skip: (+req.query.skip) });
            pagination.push({ $limit: (+req.query.limit) });
        }
        let filter = this.getFilter(req.query);
        this.db.collection(TRANSACTIONS).aggregate([
            {
                $lookup: {
                    from: "accounts",
                    localField: "debitAccountId",
                    foreignField: "id",
                    as: "debit"
                }
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "creditAccountId",
                    foreignField: "id",
                    as: "credit"
                }
            },
            {
                $project: {
                    "id": 1,
                    date: 1,
                    amount: 1,
                    creditAccountId: 1,
                    debitAccountId: 1,
                    narration: 1,
                    credit: { "$arrayElemAt": ["$credit", 0] },
                    debit: { "$arrayElemAt": ["$debit", 0] }
                }
            },
            {
                $match: filter
            }
        ]).toArray().then(trans => res.send(trans))
            .catch(err => res.status(500).send(err));
    }
    getFilter(query) {
        query.type = +query.type;
        let dateFilter;
        if (query.type == 1) {
            return {
                $and: [
                    {
                        date: { $gte: new Date(query.from) }
                    },
                    {
                        date: { $lte: new Date(query.to) }
                    }
                ]
            };
        }
        //now the filter type is anything else than date filter
        //check if from and to fileds exist?
        //if yes, then add a "Logical AND" operation bw date filter and other filter type
        let filter;
        if (query.from && query.to) {
            //initialize the filter to have an array of "Expressions"
            //which will be "Logically ANDED"
            //add only the date filter to the array
            filter = {
                $and: [
                    //date filter
                    {
                        $and: [
                            {
                                date: { $gte: new Date(query.from) }
                            },
                            {
                                date: { $lte: new Date(query.to) }
                            }
                        ]
                    }
                    //,
                    //{some other filter}
                ]
            };
        }
        //now get the filter based on the type requested by the application
        let innerFilter;
        switch (query.type) {
            case 1://filter by date range already handled
                break;
            case 2://filter by AccoutnId
                innerFilter = {
                    $or: [
                        {
                            debitAccountId: {
                                $eq: query.accountId
                            }
                        },
                        {
                            creditAccountId: {
                                $eq: query.accountId
                            }
                        }
                    ]
                };
                break;
            case 3://filter by  narration
                let matchExp = new RegExp(`.*${query.text}.*`);
                innerFilter = {
                    narration: {
                        $in: [matchExp]
                    }
                };
                break;
            default:
                break;
        }
        if (filter && filter.$and) {
            filter.$and.push(innerFilter);
        }
        else {
            filter = innerFilter;
        }
        return filter;
    }
    post(req, res) {
        delete req.body.debit;
        delete req.body.credit;
        let trans = req.body;
        trans.id = (new Date()).valueOf().toString();
        trans.date = new Date(trans.date);
        this.db.collection(TRANSACTIONS).insertOne(trans).then(() => res.send(trans)).catch(err => res.status(500).send(err));
    }
    put(req, res) {
        delete req.body._id;
        delete req.body.debit;
        delete req.body.credit;
        req.body.date = new Date(req.body.date);
        let trans = req.body;
        trans.dateUpdated = new Date();
        this.db.collection(TRANSACTIONS).updateOne({ id: req.params.id }, { $set: trans }).then(() => res.send(trans)).catch(err => res.status(500).send(err));
    }
}
TransactionsController.route = `/${TRANSACTIONS}`;
exports.TransactionsController = TransactionsController;
