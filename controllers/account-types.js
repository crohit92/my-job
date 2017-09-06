"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ACCOUNT_TYPES = "accountTypes";
class AccountTypesController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        // this.router.get('/', this.get.bind(this));
        // this.router.get('/:id', this.getById.bind(this));
        this.router.post('/multiple', this.createAccountTypes.bind(this));
    }
    createAccountTypes(req, res) {
        let accountTypes = req.body;
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
AccountTypesController.route = `/${ACCOUNT_TYPES}`;
exports.AccountTypesController = AccountTypesController;
