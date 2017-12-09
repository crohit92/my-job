import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { TypeaheadModule, ModalModule, PopoverModule, AccordionModule, BsDatepickerModule } from 'ngx-bootstrap';
import { NgProgressModule } from 'ngx-progressbar';
import { ToastrModule } from 'ngx-toastr';
import 'hammerjs';
import { ROUTES } from './app.routes';

import { Api } from './helper/api';

import { AccountsListComponent } from './accounts/accounts-list.component';
import { TasksComponent } from './tasks/tasks.component';
import { TransationsListComponent } from './transactions/transactions-list.component';
import { Filter, FilterTransactions, FilterAccounts, FilterTasks } from './loop-filter.pipe';
import { LoginComponent } from './login/login.component';
import { StorageService } from './helper/storage.service';
import { NoopInterceptor } from './helper/http-intercepter';
import { Utils } from './helper/utils';
import { CompletedTasksComponent } from './completed-tasks/completed-tasks.component';
import { UserDaybookComponent } from './user-daybook/user-daybook.component';
import { HomeComponent } from './home/home.component';
import { UserGuard, AdminGuard } from './helper/authentication-guard';

import { NgxSelectComponent } from './ngx-select/ngx-select-component';
import { NgxSelectFilterOptions } from './ngx-select/ngx-filter';
import { NgxAsyncSelectComponent } from './ngx-async-select/ngx-async-select.component';
@NgModule({
  declarations: [
    AppComponent,
    AccountsListComponent,
    TasksComponent,
    TransationsListComponent,
    Filter,
    FilterTransactions,
    FilterAccounts,
    FilterTasks,
    LoginComponent,
    CompletedTasksComponent,
    UserDaybookComponent,
    HomeComponent,
    NgxAsyncSelectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),
    NgProgressModule,
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot()
  ],
  providers: [Api,
    Utils,
    StorageService,
    UserGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoopInterceptor,
      multi: true,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
