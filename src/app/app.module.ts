import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialExportModule } from './material-export.module';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import 'hammerjs';

import { ROUTES } from './app.routes';

import { Api } from './helper/api';

import { CustomersListComponent } from './customers-list/customers-list.component';
import { CustomerComponent } from './customer/customer.component';
import { UsersListComponent } from './users/users-list.component';
import { UserComponent } from './users/user.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './tasks/task.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomersListComponent,
    CustomerComponent,
    UsersListComponent,
    UserComponent,
    TasksComponent,
    TaskComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    MaterialExportModule
  ],
  providers: [Api],
  bootstrap: [AppComponent]
})
export class AppModule { }
