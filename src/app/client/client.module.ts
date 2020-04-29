import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatButtonModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatTableModule,
  MatCheckboxModule
} from '@angular/material';
import { MatListModule } from '@angular/material';
import { MatSortModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { FileUploadModule } from 'ng2-file-upload';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { ClientRoutingModule } from './client.routing';
import { ClientComponent } from './client.component';
import { MenuModule } from '../menu/menu.module';
import { UploadPhotoComponent } from './restaurant/upload-photo/upload-photo.component';

@NgModule({
  imports: [
    CommonModule,
    ClientRoutingModule,
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
    FileUploadModule,
    MenuModule
  ],
  declarations: [
    ClientComponent,
    RestaurantComponent,
    UploadPhotoComponent,
  ],
  entryComponents: [
    UploadPhotoComponent
  ]
})
export class ClientModule {}
