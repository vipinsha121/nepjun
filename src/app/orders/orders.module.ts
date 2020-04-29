import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders.routing';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { MatExpansionModule, MatIconModule, MatButtonModule, MatNativeDateModule, MatListModule, MatTableModule, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatSelectModule} from '@angular/material';
import { RouterModule } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(OrdersRoutingModule),
    ThemeModule,
    Ng2SmartTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule, 
    MatListModule, 
    MatExpansionModule, 
    MatSortModule,  
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
  ],
  declarations: [
    OrdersComponent,  
  ],
  entryComponents: [
  ]
})
export class OrdersModule { }