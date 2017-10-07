"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var body_parser_1 = require("body-parser");
var mongodb_1 = require("mongodb");
var cors = require("cors");
var users_1 = require("./controllers/users");
var accounts_1 = require("./controllers/accounts");
var tasks_1 = require("./controllers/tasks");
var groups_1 = require("./controllers/groups");
var account_types_1 = require("./controllers/account-types");
var transactions_1 = require("./controllers/transactions");
exports.FONTS = {
    Roboto: {
        normal: __dirname + "/fonts/Roboto-Regular.ttf",
        bold: __dirname + "/fonts/Roboto-Medium.ttf",
        italics: __dirname + "/fonts/Roboto-Italic.ttf",
        bolditalics: __dirname + "/fonts/Roboto-MediumItalic.ttf"
    }
};
var Index = /** @class */ (function () {
    function Index() {
        this.port = 3000;
        this.app = express();
        this.configureMiddleware(this.app);
    }
    Index.prototype.run = function (db) {
        var $this = this;
        this.configureRoutes(this.app, db);
        this.app.listen(process.env.PORT || this.port, function () {
            console.log('Node app is running on port', $this.port);
        });
    };
    Index.prototype.configureMiddleware = function (app) {
        // app.use(express.static(__dirname ));
        // app.get('/', function (req, res) {
        //     res.sendFile(__dirname + '/index.html');
        // });
        app.use(body_parser_1.json());
        app.use(body_parser_1.urlencoded({ extended: true }));
        var options = {
            allowedHeaders: '*',
            methods: '*',
            origin: '*'
        };
        app.use(cors());
        app.use('/pdfs', express.static('pdfs'));
        //enable pre-flight
        app.options("*", cors(options));
    };
    Index.prototype.configureRoutes = function (app, db) {
        app.use(accounts_1.AccountsController.route, new accounts_1.AccountsController(db).router);
        app.use(users_1.UsersController.route, new users_1.UsersController(db).router);
        app.use(tasks_1.TasksController.route, new tasks_1.TasksController(db).router);
        app.use(groups_1.GroupsController.route, new groups_1.GroupsController(db).router);
        app.use(account_types_1.AccountTypesController.route, new account_types_1.AccountTypesController(db).router);
        app.use(transactions_1.TransactionsController.route, new transactions_1.TransactionsController(db).router);
    };
    return Index;
}());
exports.Index = Index;
mongodb_1.MongoClient.connect('mongodb://127.0.0.1:27017/myJob' /*'mongodb://heroku_04x92679:6fr8b9cda7phq058m5vlk5ecnj@ds123534.mlab.com:23534/heroku_04x92679'*/, function (err, db) {
    //console.log(db);
    new Index().run(db);
});
