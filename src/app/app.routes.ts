import { Route } from '@angular/router';
import { AccountsListComponent } from './accounts/accounts-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
import { LoginComponent } from "./login/login.component";
import { CompletedTasksComponent } from "./completed-tasks/completed-tasks.component";
export const ROUTES: Route[] = [
    
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'accounts',
        component: AccountsListComponent
    },
    {
        path: 'tasks',
        component: TasksComponent
    },
    {
        path: 'completed-tasks',
        component: CompletedTasksComponent
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