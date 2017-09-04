import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Transaction } from '../models/transaction';
const TRANSACTIONS = "transactions";

export class TransactionsController {
    public static route: string = `/${TRANSACTIONS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.get('/', this.get.bind(this));
        this.router.post('/', this.post.bind(this));
    }

    get(req: Request, res: Response) {
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

    post(req: Request, res: Response) {
        let trans: Transaction = req.body;
        trans.id = (new Date()).valueOf().toString();
        trans.date = new Date();
        this.db.collection(TRANSACTIONS).insertOne(trans).then(() => res.send(trans)).catch(err => res.status(500).send(err));
    }
}