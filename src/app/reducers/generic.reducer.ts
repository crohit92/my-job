import { Store, Action, ActionReducerMap } from '@ngrx/store';
import { Account } from './../models/account.model';
export const INSERT_MULTIPLE = "addAccounts";
export const INSERT = "addAccount";
export const UPDATE = "updateAccount";
export const DELETE = "deleteAccount";
export const FETCH = "fetchAccounts";

export const reducer = (state: Array<any> = [], action: { type: string, payload: any }) => {
    switch (action.type) {
        case INSERT_MULTIPLE:
            state = [...state, ...action.payload];
            return state;
        case INSERT:
            state = [...state, action.payload];
            return state;
    }
}