import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { CustomConfirmComponent } from './custom-confirm/custom-confirm.component';
// import { CustomEditComponent } from './custom-edit/custom-edit.component';
// import { CustomMenuComponent } from './custom-menu/custom-menu.component';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
  ],
  declarations: [
    CustomConfirmComponent,
    // CustomEditComponent,
    // CustomMenuComponent,
  ],
  entryComponents: [
    CustomConfirmComponent,
    // CustomEditComponent,
    // CustomMenuComponent,
  ]
})
export class CustomModule {}