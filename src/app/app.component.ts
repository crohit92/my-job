import { Component, OnDestroy, NgZone } from '@angular/core';
import { Utils, UserType } from "./helper/utils";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";
import { StorageService } from './helper/storage.service';
import { Constants } from "./helper/constants";
import { Firebase } from '@ionic-native/firebase';

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
  constructor(private utils: Utils,
    private router: Router,
    private storage: StorageService,
    private firebase: Firebase,
    private ngZone: NgZone
  ) {
    this.menuVisibilitySubscription = utils.subscribeMenuVisibitityEvents.subscribe((displayState) => {
      this.showMenu = displayState;
    });
    let user = this.storage.get(Constants.USER);
    this.userType = user ? user.admin : 0;
    this.userLoginSubscription = utils.subscribeLoginEvents.subscribe((userType) => {
      this.userType = userType;
    })

    document.onclick = () => {
      this.menuVisible = false;
    }

    this.subscribeNotifications();
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

  toggleMenu(event) {
    if (this.clientWidth < 768) {
      this.menuVisible = !this.menuVisible;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  subscribeNotifications() {
    const $this = this;
    try {
      this.firebase.onNotificationOpen().subscribe((notification: any) => {
        console.log(JSON.stringify(notification));
        $this.ngZone.run(() => {
          if (notification.action === 'redirect') {
            this.router.navigate([`/${notification.page}`]);
          }
        });


      });
    } catch (e) {

    }
  }
}
