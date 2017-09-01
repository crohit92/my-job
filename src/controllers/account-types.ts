import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { AccountType } from '../models/account-type';

const ACCOUNT_TYPES = "accountTypes";

export class AccountTypesController{
    public static route: string = `/${ACCOUNT_TYPES}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        // this.router.get('/', this.get.bind(this));
        // this.router.get('/:id', this.getById.bind(this));
        this.router.post('/multiple',this.createAccountTypes.bind(this))
    }
    
    private createAccountTypes(req: Request, res: Response) {
        let accountTypes = req.body as AccountType[];
        //Account Types in the system are fixed
        //so they have fixed ids which will be passed explicitly while creating

        // for (let index = 0; index < accountTypes.length; index++) {
        //     accountTypes[index].id = (new Date()).valueOf().toString();
        // }

        this.db.collection(ACCOUNT_TYPES).insertMany(accountTypes)
            .then(() => res.send(accountTypes))
            .catch((err) => res.status(500).send(err));
    }
}