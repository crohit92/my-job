import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Injectable } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';

@Injectable()
export class GenericEffects {
    constructor(
        private api: Api,
        private actions$: Actions
    ) { }
    @Effect() insert$: Observable<Action> = this.actions$.ofType('INSERT')
    .map(toPayload)
    .mergeMap(payload =>
        this.api.sendRequest({method:'post',body:payload,endpoint:ApiRoutes.CREATE_GROUP})
        // If successful, dispatch success action with result
        .map(data => ({type:'test',payload:data.json()}))
        // If request fails, dispatch failed action
        //.catch(() => of({ type: 'LOGIN_FAILED' }))
    );
}