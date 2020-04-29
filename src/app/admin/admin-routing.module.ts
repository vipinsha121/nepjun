import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { AnalyticsComponent } from '../analytics/analytics.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [{
      path: 'analytics',
      component: AnalyticsComponent,
    }, {
      path: 'users',
      component: UsersComponent,
    }, {
      path: 'menu',
      loadChildren: 'app/menu/menu.module#MenuModule'
    }, {
      path: 'settings',
      component: SettingsComponent,
    }, {
      path: 'orders',
      loadChildren: 'app/orders/orders.module#OrdersModule'
    }, {
      path: '**',
      component: UsersComponent,
    }],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
