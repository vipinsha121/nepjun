import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingComponent, ButtonViewComponent } from './pending/pending.component';
import { CompletedComponent } from './completed/completed.component';
import { RunnersComponent } from './runners.component';
import { RunnersRoutingModule } from './runners-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { MatExpansionModule, 
  MatFormFieldModule, 
  MatIconModule, 
  MatButtonModule, 
  MatNativeDateModule, 
  MatDatepickerModule, 
  MatTableDataSource,
  MatTableModule,
  MatSelectModule
} from '@angular/material';
import { MatListModule } from '@angular/material';
import { MatSortModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { CustomModule } from '../custom-component/custom-component.module';
import { AgmCoreModule } from '@agm/core';
@NgModule({
  imports: [
    CommonModule,
    RunnersRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule, 
    MatListModule, MatExpansionModule, MatSortModule,  
    MatPaginatorModule,
    MatSelectModule,
    CustomModule,
    AgmCoreModule
  ],
  declarations: [
    PendingComponent,
    CompletedComponent,
    RunnersComponent,
    OrderDetailComponent,
    ButtonViewComponent,
    OrderDetailComponent,
  ],
  entryComponents: [
    ButtonViewComponent,
    OrderDetailComponent,
  ]
})
export class RunnerModule {}
