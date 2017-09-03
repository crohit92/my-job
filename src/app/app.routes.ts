import { Route } from '@angular/router';
import { AccountsListComponent } from './accounts/accounts-list.component';
import { AccountComponent } from './accounts/account.component';
import { UsersListComponent } from './users/users-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { HomeComponent } from './home/home.component';
export const ROUTES: Route[] = [
    {
        path: 'accounts',
        component: AccountsListComponent
    },
    {
        path: 'account',
        component: AccountComponent
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
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
]