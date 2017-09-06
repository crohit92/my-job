"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ACCOUNTS = "accounts";
const GROUPS = "groups";
class GroupsController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id/accounts', this.getAccountsByGroupId.bind(this));
        this.router.post('/multiple', this.postMultiple.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/:id', this.put.bind(this));
    }
    get(req, res) {
        this.db.collection(GROUPS).find().toArray()
            .then((groups => { res.send(groups); }))
            .catch(err => res.status(500).send(err));
    }
    getAccountsByGroupId(req, res) {
        this.db.collection(ACCOUNTS).find({
            groupId: req.params.id
        }).toArray()
            .then((accounts => { res.send(accounts); }))
            .catch(err => res.status(500).send(err));
    }
    postMultiple(req, res) {
        let groups = req.body;
        //Groups in the system are fixed so the ids will explicitly
        //be passed along the create request
        // for (let index = 0; index < groups.length; index++) {
        //     groups[index].id = (new Date()).valueOf().toString();
        // }
        this.db.collection(GROUPS).insertMany(groups)
            .then(() => res.send(groups))
            .catch((err) => res.status(500).send(err));
    }
    post(req, res) {
        let group = req.body;
        this.db.collection(GROUPS).insertOne(group)
            .then(() => { res.send(group); })
            .catch(err => res.status(500).send(err));
    }
    put(req, res) {
        let group = req.body;
        delete group._id;
        this.db.collection(GROUPS)
            .updateOne({ id: req.params.id }, { $set: group })
            .then(() => { res.send(group); })
            .catch(err => res.status(500).send(err));
    }
}
GroupsController.route = `/${GROUPS}`;
exports.GroupsController = GroupsController;
