import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingComponent } from './pending/pending.component';
import { CompletedComponent } from './completed/completed.component';
import { FrontDeskComponent } from './front-desk.component';
import { FrontDeskRoutingModule } from './front-desk-routing.module';
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
  MatSelectModule,
  MatInputModule,
  MatListModule,
  MatSortModule, 
  MatPaginatorModule, 
  MatCheckboxModule
} from '@angular/material';
import { CustomModule } from '../custom-component/custom-component.module';
import { CustomerComponent, ModalComponent } from './customer/customer.component';
import { ButtonViewComponent } from './shared/buttonview.component';
import { TextAreaComponent, NotesModalComponent } from './shared/textarea.component';
import { ActiveComponent } from './active/active.component';
import { RunnersMapComponent } from './runners-map/runners-map.component';
import { AgmCoreModule } from '@agm/core';
import { UsersComponent } from './users/users.component';

@NgModule({
  imports: [
    CommonModule,
    FrontDeskRoutingModule,
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
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    CustomModule,
    AgmCoreModule
  ],
  declarations: [
    PendingComponent, 
    CompletedComponent,
    FrontDeskComponent,
    OrderDetailComponent,
    ButtonViewComponent,
    TextAreaComponent,
    CustomerComponent,
    ModalComponent,
    NotesModalComponent,
    ActiveComponent,
    RunnersMapComponent,
    UsersComponent
  ],
  entryComponents: [
    ButtonViewComponent,
    OrderDetailComponent,
    CustomerComponent,
    ModalComponent,
    TextAreaComponent,
    NotesModalComponent,
  ]
})
export class FrontDeskModule {}
