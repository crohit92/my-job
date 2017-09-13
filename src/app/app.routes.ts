import { Route } from '@angular/router';
import { AccountsListComponent } from './accounts/accounts-list.component';
import { UsersListComponent } from './users/users-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { HomeComponent } from './home/home.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
import { LoginComponent } from "./login/login.component";
export const ROUTES: Route[] = [
    
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
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
        path: 'transactions',
        component: TransationsListComponent
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    }
]