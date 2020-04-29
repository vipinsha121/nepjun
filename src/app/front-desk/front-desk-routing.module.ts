import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontDeskComponent } from './front-desk.component';
import { PendingComponent } from './pending/pending.component';
import { CompletedComponent } from './completed/completed.component';
import { ActiveComponent } from './active/active.component';
import { RunnersMapComponent } from './runners-map/runners-map.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [{
  path: '',
  component: FrontDeskComponent,
  children: [{
    path: 'pending',
    component: PendingComponent,
  }, {
    path: 'active',
    component: ActiveComponent,
  }, {
    path: 'completed',
    component: CompletedComponent,
  }, {
    path: 'map/runners',
    component: RunnersMapComponent,
  }, {
    path: 'runners',
    component: UsersComponent,
  }, {
    path: '**',
    component: PendingComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontDeskRoutingModule { }
