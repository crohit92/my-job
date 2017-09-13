import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api, ApiRoutes } from "../helper/api";
import { ToastrService } from 'ngx-toastr';
import { StorageService } from "../helper/storage.service";
import { Constants } from '../helper/constants';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials: { mobile: string, password: string };
  constructor(private api: Api,
    private router: Router,
    private alert: ToastrService,
    private storage: StorageService) { }

  ngOnInit() {
  }

  login() {
    this.api.sendRequest({
      body: this.credentials,
      endpoint: ApiRoutes.LOGIN,
      method: 'post'
    }).subscribe(response => {
      if (response.status >= 200 && response.status <= 400) {
        let user = response.json();
        this.storage.set(Constants.USER, user);
        this.router.navigate(['/home']);
      }
      else {
        this.alert.error("Invalid credentials", "Unauthorised");
      }
    })
  }
}
