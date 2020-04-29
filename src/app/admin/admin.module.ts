import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminComponent } from './admin.component';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { DropDownComponent } from './users/drop-down/drop-down.component';
import { FileUploadModule } from 'ng2-file-upload';
import {MatCheckboxModule} from '@angular/material';
import { AnalyticsModule } from '../analytics/analytics.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    AdminRoutingModule,
    NgxEchartsModule, 
    Ng2SmartTableModule,
    NgxChartsModule,
    FormsModule,
    FileUploadModule,
    MatCheckboxModule,
    AnalyticsModule
  ],
  declarations: [
    DashboardComponent, 
    UsersComponent, 
    SettingsComponent,
    AdminComponent,  
    DropDownComponent],
  entryComponents: [
    DropDownComponent,
  ]
})
export class AdminModule { }
