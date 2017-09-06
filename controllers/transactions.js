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
            }
        ]).toArray().then(trans => res.send(trans))
            .catch(err => res.status(500).send(err));
    }
    post(req, res) {
        delete req.body.debit;
        delete req.body.credit;
        let trans = req.body;
        trans.id = (new Date()).valueOf().toString();
        trans.date = new Date();
        this.db.collection(TRANSACTIONS).insertOne(trans).then(() => res.send(trans)).catch(err => res.status(500).send(err));
    }
    put(req, res) {
        delete req.body._id;
        delete req.body.debit;
        delete req.body.credit;
        let trans = req.body;
        trans.dateUpdated = new Date();
        this.db.collection(TRANSACTIONS).updateOne({ id: req.params.id }, { $set: trans }).then(() => res.send(trans)).catch(err => res.status(500).send(err));
    }
}
TransactionsController.route = `/${TRANSACTIONS}`;
exports.TransactionsController = TransactionsController;
