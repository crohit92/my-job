import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
export class UsersController {
    public static route: string = '/users';
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.get('/', (req: Request, res: Response) => {
            let users = this.db.collection('users').find(req.query).toArray();
            users.then((users)=>{
                res.status(200).send(users);
            }).catch(err=>{
                res.status(400).send(err);
            })
            
        });
        this.router.post('/', (req, res) => {
            this.db.collection('users').insertOne(req.body)
                .then(user => {
                    res.status(200).send(user);
                })
                .catch(err => {
                    res.status(400).send(err);
                });

        })
        this.router.put('/:id', (req, res) => {
            res.send(req.params.id);
        })
    }

}