import { Component, OnInit } from '@angular/core';
import { Utils } from '../helper/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private utils:Utils) { 
    this.utils.showMenu(true)
  }

  ngOnInit() {
  }

}
