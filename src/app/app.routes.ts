import { Route } from '@angular/router';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { UsersListComponent } from './users-list/users-list.component';
export const ROUTES: Route[] = [
    {
        path: 'customers',
        component: CustomersListComponent
    },
    {
        path: 'users',
        component: UsersListComponent
    },
    {
        path: '',
        redirectTo: '/customers',
        pathMatch: 'full'
    }
]