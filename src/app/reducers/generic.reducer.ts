import { Store, Action, ActionReducerMap } from '@ngrx/store';
import { Account } from './../models/account.model';
export const INSERT_MULTIPLE = "INSERT_MULTIPLE";
export const INSERT = "INSERT";
export const UPDATE = "UPDATE";
export const DELETE = "DELETE";
export const FETCH = "FETCH";

export const reducer = (state: Array<any> = [], action: { type: string, payload: any }) => {
    switch (action.type) {
        case INSERT_MULTIPLE:
            state = [...state, ...action.payload];
            return state;
        case INSERT:
            state = [...state, action.payload];
            return state;
        default:
            return state;
    }
}