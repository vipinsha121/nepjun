import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics.routing';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { MatCheckboxModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatBadgeModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BsDatepickerModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    RouterModule.forChild(AnalyticsRoutingModule),
    NgxEchartsModule, 
    Ng2SmartTableModule,
    NgxChartsModule,
    FormsModule,
    FileUploadModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    BsDatepickerModule.forRoot(),
    MatBadgeModule,
  ],
  declarations: [
    AnalyticsComponent,  
  ],
  entryComponents: [
  ]
})
export class AnalyticsModule { }