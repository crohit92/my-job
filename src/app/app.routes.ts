import { Route } from '@angular/router';
import { AccountsListComponent } from './accounts/accounts-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
import { LoginComponent } from "./login/login.component";
import { CompletedTasksComponent } from "./completed-tasks/completed-tasks.component";
import { UserDaybookComponent } from "./user-daybook/user-daybook.component";
import { HomeComponent } from './home/home.component';
import { UserGuard, AdminGuard } from './helper/authentication-guard';
export const ROUTES: Route[] = [

    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate:[UserGuard]
    },
    {
        path: 'accounts',
        component: AccountsListComponent,
        canActivate:[AdminGuard]

    },
    {
        path: 'tasks',
        component: TasksComponent,
        canActivate:[UserGuard]
    },
    {
        path: 'completed-tasks',
        component: CompletedTasksComponent
    },
    {
        path: 'transactions',
        component: TransationsListComponent,
        canActivate:[AdminGuard]
    },
    {
        path: 'user-daybook',
        component: UserDaybookComponent,
        canActivate:[UserGuard]
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    }
]