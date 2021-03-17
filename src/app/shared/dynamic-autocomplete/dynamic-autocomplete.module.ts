import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicAutocompleteRoutingModule } from './dynamic-autocomplete-routing';
import { DynamicAutocompleteComponent } from './dynamic-autocomplete.component';
import { DynamicAutocompleteNgmodelComponent } from './dynamic-autocomplete-ngmodel/dynamic-autocomplete-ngmodel.component';

import { CommonService } from '../../core/services/common/common.service';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteRoutingModule,
    AppMaterialModule
  ],
  declarations: [
    DynamicAutocompleteComponent,
    DynamicAutocompleteNgmodelComponent,
  ],
  exports: [
    DynamicAutocompleteComponent,
    DynamicAutocompleteNgmodelComponent
  ],
  providers: [
    CommonService,
  ]
})
export class DynamicAutocompleteModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: DynamicAutocompleteModule,
      providers: [
        CommonService,
      ]
    };
  }
}



