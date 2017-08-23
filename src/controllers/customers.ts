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
        this.router.post('/', this.createCustomer.bind(this));
        this.router.put('/:id', this.updateCustomer.bind(this));
        this.router.delete('/:id',this.deleteCustomer.bind(this))

    }

    private customers(req: Request, res: Response) {

        this.db
            .collection(CUSTOMERS)
            .find().toArray()
            .then((customers: Customer[]) => {
                res.status(200).send(customers);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private customer(req: Request, res: Response) {
       this.fetchCustomer(req.params.id)
       .then((customers: Customer) => {
                res.status(200).send(customers);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    public fetchCustomer(customerId:string):Promise<Customer>{
         return this.db
            .collection(CUSTOMERS)
            .findOne({ _id: new ObjectID(customerId) })
            
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

    private updateCustomer(req: Request, res: Response) {
        delete req.body._id;
        this.db.collection(CUSTOMERS)
            .updateOne({ _id: new ObjectID(req.params.id) }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    private deleteCustomer(req:Request,res:Response){
        this.db.collection(CUSTOMERS).deleteOne({_id:new ObjectID(req.params.id)})
        .then(deleteResult=>res.send())
        .catch(error=>res.status(400).send(error));
    }
}