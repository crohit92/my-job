import { Route } from '@angular/router';
import { AccountsListComponent } from './accounts/accounts-list.component';
import { UsersListComponent } from './users/users-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { HomeComponent } from './home/home.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
export const ROUTES: Route[] = [
    {
        path: 'accounts',
        component: AccountsListComponent
    },
    {
        path: 'users',
        component: UsersListComponent
    },
    {
        path: 'tasks',
        component: TasksComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'transactions',
        component: TransationsListComponent
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
]