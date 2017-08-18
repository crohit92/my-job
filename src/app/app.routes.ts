import { Route } from '@angular/router';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { UsersListComponent } from './users/users-list.component';
import { TasksComponent } from './tasks/tasks.component';
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
        path:'tasks',
        component:TasksComponent
    },
    {
        path: '',
        redirectTo: '/customers',
        pathMatch: 'full'
    }
]