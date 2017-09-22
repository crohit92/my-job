import { Component, OnDestroy } from '@angular/core';
import { Utils, UserType } from "./helper/utils";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";
import { StorageService } from './helper/storage.service';
import { Constants } from "./helper/constants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  showMenu: boolean;
  menuVisible: boolean = false;
  clientWidth: number;
  userType: number;

  menuVisibilitySubscription: Subscription;
  userLoginSubscription: Subscription;
  constructor(private utils: Utils, private router: Router, private storage: StorageService) {
    this.menuVisibilitySubscription = utils.subscribeMenuVisibitityEvents.subscribe((displayState) => {
      this.showMenu = displayState;
    });
    let user = this.storage.get(Constants.USER);
    this.userType = user?user.admin:0;
    this.userLoginSubscription = utils.subscribeLoginEvents.subscribe((userType) => {
      this.userType = userType;
    })
  }

  ngOnDestroy() {
    this.menuVisibilitySubscription.unsubscribe();
    this.userLoginSubscription.unsubscribe();
  }

  logout() {
    this.menuVisible = false;
    this.storage.clear();
    this.router.navigate(['/login'])
  }

  onResize(event) {
    this.clientWidth = event.target.innerWidth;
    if (this.clientWidth < 768) {
      this.menuVisible = false;
    }
    else {
      this.menuVisible = true;
    }
  }

  onLoad(event) {
    this.clientWidth = event.target.documentElement.clientWidth;
    if (this.clientWidth >= 768) {
      this.menuVisible = true;
    }
  }

  toggleMenu() {
    if (this.clientWidth < 768) {
      this.menuVisible = !this.menuVisible;
    }
  }
}
