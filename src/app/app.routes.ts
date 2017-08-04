import {Route} from '@angular/router';
import { CustomersListComponent } from './customers-list/customers-list.component';
export const ROUTES:Route[] = [
    {
        path: 'customers-list',
        component: CustomersListComponent
    },
    {
        path: '',
        redirectTo:'/customers-list',
        pathMatch:'full'
    }
]