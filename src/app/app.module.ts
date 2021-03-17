import { NgModule, Injector } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { AppRoutes } from './app.routing';
import { Configuration } from './app.constants';

import { AppInjector } from './app-injector.service';
import { CommonDataService } from './core/services/common/common-data.service';
import { OrgnizationsettingService } from "./core/services/public/orgnizationsetting.service";

import { HttpErrorInterceptor } from './core/services/common/http-error.interceptor';

@NgModule({
    imports:      [
      CommonModule,
      BrowserAnimationsModule,
      FormsModule,
      RouterModule.forRoot(AppRoutes,{
        useHash: true
      }),
      HttpClientModule,
        
    ],
    declarations: [
      AppComponent,
    ],
    providers : [
      Configuration,
      CommonDataService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: HttpErrorInterceptor,
        multi: true
      },
      OrgnizationsettingService
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { 

  constructor(injector:Injector){
    // Store module's injector in the AppInjector class
    // console.log('Expected #1: storing app injector');
    AppInjector.setInjector(injector);
  }

}
