import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RunnersComponent } from './runners.component';
import { PendingComponent } from './pending/pending.component';
import { CompletedComponent } from './completed/completed.component';

const routes: Routes = [{
  path: '',
  component: RunnersComponent,
  children: [{
    path: 'pending/:runnerId',
    component: PendingComponent,
  }, {
    path: 'completed/:runnerId',
    component: CompletedComponent,
  }, {
    path: '**',
    component: PendingComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RunnersRoutingModule { }
