import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '../helper/utils';
import { StorageService } from '../helper/storage.service';
import { Constants } from '../helper/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userType: number;

  constructor(private utils: Utils, private storage: StorageService, private router: Router) {
    this.utils.showMenu(true)
    let user = this.storage.get(Constants.USER);
    this.userType = user ? user.admin : 0;
  }

  ngOnInit() {
  }

  logout() {

    this.storage.clear();
    this.router.navigate(['/login'])
  }
}
