import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuVisible: boolean = false;
  clientWidth: number;
  
  onResize(event){
    this.clientWidth = event.target.innerWidth;
    if(this.clientWidth < 768){
      this.menuVisible = false;
    }
    else{
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
    if(this.clientWidth < 768){
      this.menuVisible = !this.menuVisible;
    }
  }
}
