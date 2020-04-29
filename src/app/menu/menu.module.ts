import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu.routing';
import { MenuComponent } from './menu.component';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddMenuModalComponent } from './add-menu-modal/add-menu-modal.component';
import { AddCagetoryModalComponent } from './add-cagetory-modal/add-cagetory-modal.component';
import { AddItemModalComponent } from './add-item-modal/add-item-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import {MatCheckboxModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule} from '@angular/material';
import {MatIconModule} from '@angular/material/icon'
import { RouterModule } from '@angular/router';
import { CustomMenuComponent } from '../custom-component/custom-menu/custom-menu.component';
import { CustomEditComponent } from '../custom-component/custom-edit/custom-edit.component';
import { ModalModule } from 'ngx-bootstrap';
import { CustomModule } from '../custom-component/custom-component.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    RouterModule.forChild(MenuRoutingModule),
    Ng2SmartTableModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ModalModule.forRoot(),
    CustomModule
  ],
  declarations: [
    MenuComponent,  
    AddMenuModalComponent, 
    AddCagetoryModalComponent, 
    AddItemModalComponent,
    CustomMenuComponent,
    CustomEditComponent,
  ],
  entryComponents: [
    AddMenuModalComponent, 
    AddCagetoryModalComponent, 
    AddItemModalComponent,
    CustomMenuComponent,
    CustomEditComponent,
  ]
})
export class MenuModule { }