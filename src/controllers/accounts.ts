import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Account } from '../models/account';
import { Group } from './../models/group';
import { Transaction } from '../models/transaction';
import { AccountType } from '../models/account-type';
//import 'pdfmake';
import * as Printer from 'pdfmake/src/printer';
import { FONTS } from '../index';
const ACCOUNTS = "accounts";
const GROUPS = "groups";

export class AccountsController {
    public static route: string = `/${ACCOUNTS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.post('/:id/makeStatement', this.makePdf.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.put('/refreshToken', this.refreshToken.bind(this));
        this.router.put('/:id', this.put.bind(this));
        this.router.delete('/:id', this.delete.bind(this))
    }

    private get(req: Request, res: Response) {
        let filterString = req.query.filter;
        const textFilter = {
            $or: [
                { name: new RegExp(`.*${filterString}.*`, 'i') },
                { mobile: new RegExp(`.*${filterString}.*`, 'i') },
            ]
        };
        const groupFilter = { groupId: req.query.groupId };
        let filter = req.query.hasOwnProperty('groupId') ? (filterString ? { ...textFilter, ...groupFilter } : groupFilter) : (filterString ? textFilter : {});
        let pagination = [];
        if (req.query.hasOwnProperty('skip') && req.query.hasOwnProperty('limit')) {
            pagination.push({ $skip: (+req.query.skip) })
            pagination.push({ $limit: (+req.query.limit) })
        }


        this.db
            .collection(ACCOUNTS)
            .aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'groups',
                        localField: 'groupId',
                        foreignField: 'id',
                        as: 'group'
                    }
                },
                {
                    $project: {
                        "address": "$address",
                        "group": "$group",
                        "groupId": "$groupId",
                        "id": "$id",
                        "mobile": "$mobile",
                        "name": { "$toLower": "$name" },
                        "natureOfOB": "$natureOfOB",
                        "openingBalance": "$openingBalance"
                    }
                },
                {
                    $sort: { name: 1 }
                },
                ...pagination

            ]).toArray()
            .then((accounts: Account[]) => {
                res.status(200).send(accounts);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private getById(req: Request, res: Response) {
        this.db
            .collection(ACCOUNTS)
            .aggregate([
                {
                    $match: {
                        id: req.params.id
                    }
                },
                {
                    $lookup: {
                        from: 'groups',
                        localField: 'groupId',
                        foreignField: 'id',
                        as: 'group'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        localField: 'id',
                        foreignField: 'debitAccountId',
                        as: 'debits'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        localField: 'id',
                        foreignField: 'creditAccountId',
                        as: 'credits'
                    }
                },
                {
                    $project: {
                        id: '$id',
                        openingBalance: '$openingBalance',
                        natureOfOB: '$natureOfOB',
                        name: '$name',
                        groupId: '$groupId',
                        group: {
                            $arrayElemAt: ['$group', 0]
                        },
                        credits: '$credits',
                        debits: '$debits'
                    }
                },
                {
                    $lookup: {
                        from: 'accountTypes',
                        localField: 'group.accountTypeId',
                        foreignField: 'id',
                        as: 'accountType'
                    }
                },
                {
                    $project: {
                        id: '$id',
                        openingBalance: '$openingBalance',
                        natureOfOB: '$natureOfOB',
                        name: '$name',
                        groupId: '$groupId',
                        group: '$group',
                        accountType: {
                            $arrayElemAt: ['$accountType', 0]
                        },
                        credits: '$credits',
                        debits: '$debits'
                    }
                }

            ]).next().then((account: Account) => {

                account.debit = 0;
                account.debits.forEach(debit => {
                    account.debit += debit.amount
                });
                account.credit = 0;
                account.credits.forEach(credit => {
                    account.credit += credit.amount
                });
                res.status(200).send(account);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private getDateString(date: Date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    private pushToLedger(_transactions: Array<string[]>, transaction: Transaction, accountId: string) {
        let addedToList = false;
        for (var index = 0; index < _transactions.length; index++) {
            var _transaction = _transactions[index];
            if (transaction.debitAccountId == accountId) {
                if (_transaction[0] == '') {
                    _transaction[0] = this.getDateString(new Date(transaction.date));
                    _transaction[1] = transaction.credit.name;
                    _transaction[2] = transaction.amount + '';
                    addedToList = true;
                    break;
                }
            }
            else {
                if (_transaction[3] == '') {
                    _transaction[3] = this.getDateString(new Date(transaction.date));
                    _transaction[4] = transaction.debit.groupId == '17' ? 'Cash' : transaction.debit.name;
                    _transaction[5] = transaction.amount + '';
                    addedToList = true;
                    break;
                }
            }

        }
        if (!addedToList) {
            if (transaction.debitAccountId == accountId) {
                _transactions.push([this.getDateString(new Date(transaction.date)), transaction.credit.name, transaction.amount, '', '', '']);
            }
            //if account is credited
            else {
                _transactions.push(['', '', '', this.getDateString(new Date(transaction.date)), transaction.debit.groupId == '17' ? 'Cash' : transaction.debit.name, transaction.amount]);
            }

        }
    }

    private makePdf(req: Request, res: Response) {
        let totalDebit = 0;
        let totalCredit = 0;
        let account: any;
        let accountInfo: any = req.body.accountInfo;
        let transactions: Transaction[] = req.body.transactions;
        let _transactions: Array<string[]> = new Array<string[]>();
        let accountId = req.params.id;
        for (let index = 0; index < transactions.length; index++) {
            let transaction = transactions[index];
            if (transaction.debitAccountId == accountId) {
                account = transaction.debit;
                totalDebit += transaction.amount;
            }
            else {
                account = transaction.credit;
                totalCredit += transaction.amount;
            }
            this.pushToLedger(_transactions, transaction, accountId);

        }

        let docDefinition = {
            content: [
                {
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 2,
                        widths: [85, '*', 85, 85, '*', 85],

                        body: [
                            [{ text: `${account.name}`, colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {}],
                            ['Date', 'Particulars', 'Amount', 'Date', 'Particulars', 'Amount'],
                            ..._transactions,
                            ['', '', totalDebit, '', '', totalCredit],
                            ['', '', '', '', '', ''],
                            [{ text: 'Balance', colSpan: 5 }, '', '', '', '', {
                                text:
                                    (accountInfo.accountType.nature == 'dr' ?
                                        `${accountInfo.debit - accountInfo.credit}` :
                                        `${accountInfo.credit - accountInfo.debit}`)
                            }]
                        ]
                    }
                }
            ]
        };
        var printer = new Printer(FONTS);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(`pdfs/${accountId}.pdf`));
        pdfDoc.end();
        res.status(200).send({ message: "Pdf Generated Successfully" });
    }
    private post(req: Request, res: Response) {
        req.body.id = (new Date()).valueOf().toString();
        let account = req.body;
        //check if account is a user account
        if (account.groupId == '17') {
            this.db.collection(ACCOUNTS).findOne({
                groupId: '17',
                mobile: account.mobile
            }).then(existingAccount => {
                if (existingAccount) {
                    res.status(403).send({ message: "User with this mobile number already exists" });
                    return;
                } else {
                    this.db
                        .collection(ACCOUNTS)
                        .insertOne(req.body)
                        .then((accnt: InsertOneWriteOpResult) => {
                            res.send(account);
                        }).catch(err => {
                            res.status(400).send(err);
                        })
                }
            })
        } else {
            this.db
                .collection(ACCOUNTS)
                .insertOne(req.body)
                .then((accnt: InsertOneWriteOpResult) => {
                    res.send(account);
                }).catch(err => {
                    res.status(400).send(err);
                })
        }


    }

    private login(req: Request, res: Response) {
        this.db.collection(ACCOUNTS).findOne({
            $and: [{
                mobile: { $eq: req.body.mobile }
            },
            {
                password: { $eq: req.body.password }
            }]
        }).then(user => {
            if (user) {
                res.send(user)
            }
            else {
                res.status(403).send();
            }
        }).catch(err => res.status(500).send(err));
    }

    private put(req: Request, res: Response) {
        delete req.body._id;
        if (req.body.groupId == '17' && req.body.admin != 2) {
            this.db.collection(ACCOUNTS).find({
                groupId: '17',
                admin: 2
            }).toArray().then((accounts: Account[]) => {
                if (accounts.length == 1 && accounts[0].id == req.body.id) {
                    res.status(403).send({ message: "Cannot delete all super admins" });
                    return;
                }
            })
        }
        this.db.collection(ACCOUNTS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    private delete(req: Request, res: Response) {
        let deleteUser = (accountId) => {
            Promise.all([
                this.db.collection(ACCOUNTS).deleteOne({ id: accountId }),
                this.db.collection('transactions').deleteMany({
                    $or: [
                        {
                            debitAccountId: accountId
                        },
                        {
                            creditAccountId: accountId
                        }
                    ]
                }),
                this.db.collection('tasks').deleteMany({
                    $or: [
                        {
                            assignedToId: accountId
                        },
                        {
                            customerId: accountId
                        }
                    ]
                })
            ]).then(deleteResult => res.send({ deleted: true }))
                .catch(error => res.status(400).send(error));
        }
        this.db.collection(ACCOUNTS).find({
            groupId: '17',
            admin: 2
        }).toArray().then(accounts => {
            if (accounts.length == 1 && accounts[0].id == req.params.id) {
                res.status(500).send({ message: 'Cannot delete all super admin accounts' })
            }
            else {
                if (req.query.force == '1') {
                    deleteUser(req.params.id)
                }
                else {
                    let userBeingUsed = false;
                    let promises = [
                        this.db.collection('transactions').findOne({ $or: [{ debitAccountId: req.params.id }, { creditAccountId: req.params.id }] }),
                        this.db.collection('tasks').findOne({ $or: [{ assignedToId: req.params.id }, { customerId: req.params.id }] })
                    ]
                    Promise.all(promises).then((userFound) => {
                        if (userFound[0] || userFound[1]) {
                            res.status(500).send({ message: 'User is being used in transactions or tasks\nIf this user is deleted, all associated transactions and tasks will also be deleted\nDo you want to continue?' })
                        }
                        else {
                            deleteUser(req.params.id)
                        }
                    })
                }
            }
        })

    }

    public refreshToken(req: Request, res: Response) {
        const payload = req.body as { token: string, userId: string };
        this.db.collection(ACCOUNTS).updateOne({
            id: payload.userId
        }, {
                $set: {
                    token: payload.token
                }
            }).then(response => {
                res.send({ message: 'token saved' });
            }).catch(() => {
                res.status(500).send({ error: 'Error while saving token' });
            })
    }

}