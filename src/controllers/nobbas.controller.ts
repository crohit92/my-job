import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import {appendFile} from 'fs';
const NOBBAS = "nobbas";

export class NobbasController {
    public static route: string = `/${NOBBAS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.post('/', this.storeEmail.bind(this));
    }
    storeEmail(req:Request,res:Response){
        appendFile('emails.list',`${req.body.email}\n`,(err)=>{
            if(err){res.status(500).send(err)}
            else{
                res.send({saved:true,email:req.body.email});
            }
        })
    }
}