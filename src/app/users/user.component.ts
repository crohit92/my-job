import { Input, Output, Component, EventEmitter } from '@angular/core';
import { Api, ApiRoutes, Request } from './../helper/api'
@Component({
    templateUrl: './user.html',
    selector: 'user'
})
export class UserComponent {
    @Input('user') user: any = {};
    @Output('userUpdated') userUpdated = new EventEmitter<any>();
    @Output('userDeleted') userDeleted = new EventEmitter<any>();

    constructor(
        private api: Api
    ) { }
    updateUser() {
        if (this.user && this.user.id) {
            this.api.sendRequest({
                endpoint: ApiRoutes.UPDATE_USER,
                routeParams: {
                    '': this.user.id
                },
                method: 'put',
                body: this.user
            }).subscribe(
                res => {
                    this.userUpdated.emit();
                    this.user = {}
                },
                err => { console.log(err); }
                );
        }
        else {
            this.api.sendRequest({
                endpoint: ApiRoutes.CREATE_USER,
                method: 'post',
                body: this.user
            }).subscribe(
                res => {
                    this.userUpdated.emit();
                    this.user = {}
                },
                err => { console.log(err); }
                );
        }
    }

    deleteUser(event) {
        this.api.sendRequest({
            endpoint: ApiRoutes.DELETE_USER,
            method: 'delete',
            routeParams: {
                '': this.user.id
            }
        }).subscribe(
            res => { 
                this.userDeleted.emit();
                this.user = {} 
            },
            err => { console.log(err); }
            );
    }
}