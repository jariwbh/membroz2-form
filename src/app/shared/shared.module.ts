import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedRoutingModule } from './shared-routing.module';

import { AppMaterialModule } from '../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedRoutingModule,
    AppMaterialModule
  ],
  declarations: [
  ],
  exports : [
    AppMaterialModule,
    ReactiveFormsModule
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders <SharedModule>{
    return {
      ngModule: SharedModule,
    };
  }
}
