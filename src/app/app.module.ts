import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialExportModule } from './material-export.module';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import 'hammerjs';

import { ROUTES } from './app.routes';

import { Api } from './helper/api';

import { AccountsListComponent } from './accounts/accounts-list.component';
import { UsersListComponent } from './users/users-list.component';
import { UserComponent } from './users/user.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './tasks/task.component';
import { HomeComponent } from './home/home.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
import { Filter } from './loop-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AccountsListComponent,
    UsersListComponent,
    UserComponent,
    TasksComponent,
    TaskComponent,
    HomeComponent,
    TransationsListComponent,
    Filter
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    MaterialExportModule,
    TypeaheadModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [Api],
  bootstrap: [AppComponent]
})
export class AppModule { }
