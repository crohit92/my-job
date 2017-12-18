import { Router, Express } from 'express';
import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import { MongoClient, Db } from 'mongodb';
import * as cors from "cors";

import { UsersController } from './controllers/users';
import { AccountsController } from './controllers/accounts';
import { TasksController } from './controllers/tasks';
import { GroupsController } from './controllers/groups';
import { AccountTypesController } from './controllers/account-types';
import { TransactionsController } from "./controllers/transactions";

const appVersion = '1.0.1';
export const FONTS = {
    Roboto: {
        normal: `${__dirname}/fonts/Roboto-Regular.ttf`,
        bold: `${__dirname}/fonts/Roboto-Medium.ttf`,
        italics: `${__dirname}/fonts/Roboto-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/Roboto-MediumItalic.ttf`
    }
}

export class Index {
    public app: Express;
    private port: number = 3000;

    constructor() {
        this.app = express();
        this.app.use(function (req, res, next) {
            let mobileAppVersion = req.query.appVersion;
            if (mobileAppVersion && mobileAppVersion == appVersion) {
                next();
            }
            else {
                next(`Mobile App version not compatible with this api
                Api Version: ${appVersion}
                Mobile App Version: ${mobileAppVersion}`
            );
            }
        })
        this.configureMiddleware(this.app);
    }

    run(db: Db) {
        let $this = this;
        this.configureRoutes(this.app, db);
        this.app.listen(process.env.PORT || this.port, function () {
            console.log('Node app is running on port', $this.port);
        });
    }

    private configureMiddleware(app: express.Express) {
        // app.use(express.static(__dirname ));
        // app.get('/', function (req, res) {
        //     res.sendFile(__dirname + '/index.html');
        // });
        app.use(json());
        app.use(urlencoded({ extended: true }));
        let options: cors.CorsOptions = {
            allowedHeaders: '*',
            methods: '*',
            origin: '*'
        }
        app.use(cors())
        app.use('/pdfs', express.static('pdfs'))
        //enable pre-flight
        app.options("*", cors(options));
    }

    private configureRoutes(app: express.Router, db: Db) {
        app.use(AccountsController.route, new AccountsController(db).router);
        app.use(UsersController.route, new UsersController(db).router);
        app.use(TasksController.route, new TasksController(db).router);
        app.use(GroupsController.route, new GroupsController(db).router);
        app.use(AccountTypesController.route, new AccountTypesController(db).router);
        app.use(TransactionsController.route, new TransactionsController(db).router);
    } 
}

MongoClient.connect('mongodb://127.0.0.1:27017/myJob'/*'mongodb://heroku_04x92679:6fr8b9cda7phq058m5vlk5ecnj@ds123534.mlab.com:23534/heroku_04x92679'*/,
    (err, db) => {
        //console.log(db);        
        new Index().run(db);
    });
