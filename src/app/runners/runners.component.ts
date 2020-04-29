import { Component, OnInit } from '@angular/core';
import { MENU_ITEMS } from './runners-menu';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'runners',
  template: `
    <food-ordering-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </food-ordering-layout>
  `,
})
export class RunnersComponent implements OnInit {
  menu = MENU_ITEMS;

  constructor(private cookieService: CookieService) { }

  ngOnInit() {
    this.cookieService.delete('user', '/');
    const runnerId = localStorage.getItem('runnerId')
    this.menu.forEach(element => {
      element.link += runnerId
    });

  }

}
