import { Router, Express } from 'express';
import * as express from 'express';
import * as http from 'http';
import { json, urlencoded } from 'body-parser';
import {UsersController} from './controllers/users';
import * as mongodb from 'mongodb';
import {MongoClient,Db} from 'mongodb';

export class Index{
    public app: Express;
    private port: number = 2000;
    constructor() {
        this.app = express();
        this.configureMiddleware(this.app);
    }

    run(db:Db){
        let $this = this;
        this.configureRoutes(this.app,db);
        this.app.listen(this.port, function () {
            console.log('Node app is running on port', $this.port);
        });
    }

    private configureMiddleware(app: express.Express) {
        app.use(json());
        app.use(urlencoded({ extended: true }));
    }

    private configureRoutes(app: express.Router,db:Db) {

        app.use(UsersController.route, new UsersController(db).router)
    }

}
MongoClient.connect('mongodb://crohit92:Mohit_4085@ds129023.mlab.com:29023/heroku_5qdxqckm',
(err,db)=>{
    new Index().run(db);
});
