import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Customer } from '../models/customer';

const CUSTOMERS = "customers";
export class CustomerController {
    public static route: string = `/${CUSTOMERS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        
        this.router.get('/', this.customers.bind(this));
        this.router.get('/:id', this.customer.bind(this));
        this.router.post('/',this.createCustomer.bind(this));
        
    }

    private customers(req: Request, res: Response) {
        console.log('fetch all customers');
        
        this.db
            .collection(CUSTOMERS)
            .find().toArray()
            .then((customers: Customer[]) => {
                console.log(customers);
                
                res.status(200).send(customers);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private customer(req: Request, res: Response) {
        this.db
            .collection(CUSTOMERS)
            .find(new ObjectID(req.params.id)).toArray()
            .then((customers: Customer[]) => {
                res.status(200).send(customers);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private createCustomer(req: Request, res: Response) {
        this.db
            .collection(CUSTOMERS)
            //.find(new ObjectID(req.params.id)).toArray()
            .insertOne(req.body)
            .then((cust: InsertOneWriteOpResult) => {
                res.send(cust.insertedId);
            }).catch(err => {
                res.status(400).send(err);
            })
    }
}