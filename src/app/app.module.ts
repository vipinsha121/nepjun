import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeModule } from './@theme/theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from './@core/core.module';
import { ToastrModule} from 'ngx-toastr';

import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { SmartTableService } from './@core/data/smart-table.service';
import { CookieService } from 'ngx-cookie-service';
import { FileService } from './services/file.service';
import {MatCheckboxModule} from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ToastrModule.forRoot({ positionClass: 'toastr-top-full-width', timeOut: 2500, autoDismiss: true, maxOpened: 10}),
    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    MatCheckboxModule,
    OverlayModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC9iuV5SYOtHB5A3PKgGXti61JIQBxghJg',
      libraries: ['places']
    }),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    ApiService,
    FileService,
    CookieService,
    SmartTableService,
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
