import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BaseComponemntRoutes } from './base-componemnt-routing';
import { BaseComponemntComponent } from './base-componemnt.component';
import { BaseLiteComponemntComponent } from './base-lite-componemnt/base-lite-componemnt.component';

import { AppMaterialModule } from '../../app-material/app-material.module';
@NgModule({
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(BaseComponemntRoutes),
    AppMaterialModule
    
  ],
  declarations: [
    BaseComponemntComponent,
    BaseLiteComponemntComponent
  ],
  exports:[
    BaseComponemntComponent,
    BaseLiteComponemntComponent
  ]
})
export class BaseComponemntModule { }
