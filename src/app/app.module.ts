import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GenericEffects } from './effects/generic.effects';
import { reducer } from './reducers/generic.reducer';
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
import { AccountComponent } from './accounts/account.component';
import { UsersListComponent } from './users/users-list.component';
import { UserComponent } from './users/user.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './tasks/task.component';
import { HomeComponent } from './home/home.component'

@NgModule({
  declarations: [
    AppComponent,
    AccountsListComponent,
    AccountComponent,
    UsersListComponent,
    UserComponent,
    TasksComponent,
    TaskComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    MaterialExportModule,
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    StoreModule.forRoot({ accounts: reducer }),
    EffectsModule.forRoot([GenericEffects])
  ],
  providers: [Api],
  bootstrap: [AppComponent]
})
export class AppModule { }
