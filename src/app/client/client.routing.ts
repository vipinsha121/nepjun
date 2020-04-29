import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientComponent } from './client.component';
import { RestaurantComponent } from './restaurant/restaurant.component';

const routes: Routes = [{
  path: '',
  component: ClientComponent,
  children: [{
    path: 'restaurant',
    component: RestaurantComponent,
  }, {
    path: 'menu',
    loadChildren: 'app/menu/menu.module#MenuModule'
  }, {
    path: 'analytics',
    loadChildren: 'app/analytics/analytics.module#AnalyticsModule'
  }, {
    path: 'orders',
    loadChildren: 'app/orders/orders.module#OrdersModule'
  }, {
    path: '**',
    component: RestaurantComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
