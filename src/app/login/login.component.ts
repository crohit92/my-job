import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api, ApiRoutes } from "../helper/api";
import { ToastrService } from 'ngx-toastr';
import { StorageService } from "../helper/storage.service";
import { Constants } from '../helper/constants';
import { User } from "../models/user.model";
import { Utils } from "../helper/utils";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials: { mobile?: string, password?: string } = {};
  constructor(private api: Api,
    private router: Router,
    private alert: ToastrService,
    private storage: StorageService,
    private utils:Utils
  ) { 
    this.utils.showMenu(false);
  }

  ngOnInit() {
  }

  login() {
    this.api.sendRequest({
      body: this.credentials,
      endpoint: ApiRoutes.LOGIN,
      method: 'post'
    }).subscribe(response => {
      let user = response as User;
      this.storage.set(Constants.USER, user);
      this.utils.loginSuccess(user);
      if(user.admin == 0){
        this.router.navigate(['/tasks']);
      }
      else{
        this.router.navigate(['/home']);
      }
      
    }, (err => {
      this.alert.error("Invalid credentials", "Unauthorised");
    }))
  }
}
