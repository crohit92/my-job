"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const users_1 = require("./controllers/users");
const accounts_1 = require("./controllers/accounts");
const tasks_1 = require("./controllers/tasks");
const groups_1 = require("./controllers/groups");
const account_types_1 = require("./controllers/account-types");
const transactions_1 = require("./controllers/transactions");
class Index {
    constructor() {
        this.port = 8080;
        this.app = express();
        this.configureMiddleware(this.app);
    }
    run(db) {
        let $this = this;
        this.configureRoutes(this.app, db);
        this.app.listen(process.env.PORT || this.port, function () {
            console.log('Node app is running on port', $this.port);
        });
    }
    configureMiddleware(app) {
        // app.use(express.static(__dirname ));
        // app.get('/', function (req, res) {
        //     res.sendFile(__dirname + '/index.html');
        // });
        app.use(body_parser_1.json());
        app.use(body_parser_1.urlencoded({ extended: true }));
        let options = {
            allowedHeaders: '*',
            methods: '*',
            origin: '*'
        };
        app.use(cors());
        //enable pre-flight
        app.options("*", cors(options));
    }
    configureRoutes(app, db) {
        app.use(accounts_1.AccountsController.route, new accounts_1.AccountsController(db).router);
        app.use(users_1.UsersController.route, new users_1.UsersController(db).router);
        app.use(tasks_1.TasksController.route, new tasks_1.TasksController(db).router);
        app.use(groups_1.GroupsController.route, new groups_1.GroupsController(db).router);
        app.use(account_types_1.AccountTypesController.route, new account_types_1.AccountTypesController(db).router);
        app.use(transactions_1.TransactionsController.route, new transactions_1.TransactionsController(db).router);
    }
}
exports.Index = Index;
mongodb_1.MongoClient.connect('mongodb://127.0.0.1:27017/myJob' /*'mongodb://heroku_04x92679:6fr8b9cda7phq058m5vlk5ecnj@ds123534.mlab.com:23534/heroku_04x92679'*/, (err, db) => {
    //console.log(db);
    new Index().run(db);
});
