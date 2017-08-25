import { Component } from '@angular/core';

export class Menu {
  link: string;
  label: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuVisible:boolean = false;
  menus:Menu[];
  constructor(){
    this.menus = [
      {
        label:'Customers',
        link:'/customers-list'
      }
    ]
  }
}
