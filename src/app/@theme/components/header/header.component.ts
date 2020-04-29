import { Component, Input, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService } from '../../../@nebular/theme';
import { AnalyticsService } from '../../../@core/utils/analytics.service';
import { CookieService } from 'ngx-cookie-service';
import { Utils } from '../../../common';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {


  @Input() position = 'normal';

  logoutAvailable = false;
  user: any;
  userMenu = [{ title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private analyticsService: AnalyticsService,
              private cookieService: CookieService,
              private router: Router) {
  }

  ngOnInit() {
    if (this.cookieService.get('user')) {
      this.user = Utils.decodeJwt(this.cookieService.get('user'))
      this.menuService.onItemClick().subscribe((event) => {
        this.onItemSelection(event.item.title);
      });
      localStorage.removeItem('runnerId')
      this.logoutAvailable = true;
    } else {
      this.cookieService.delete('user', '/');
      this.logoutAvailable = false;
    }
  }

  onItemSelection( title ) {
    if (title === 'Log out') {
      if (!this.logoutAvailable) return;
      this.cookieService.delete('user', '/');
      localStorage.removeItem('hideSoundBtn');
      var _this = this;
      setTimeout(function() {
        _this.router.navigate(['/auth/login'], { replaceUrl : true });
      }, 1000);
    }
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  toggleSettings(): boolean {
    this.sidebarService.toggle(false, 'settings-sidebar');
    return false;
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
}
