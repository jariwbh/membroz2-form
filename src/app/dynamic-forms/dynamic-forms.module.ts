import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule,DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './dynamic-forms-routing';
import { DynamicFormsComponent } from './dynamic-forms.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';

import { AppMaterialModule } from '../app-material/app-material.module';

import { CommonService  } from '../core/services/common/common.service';

import { DynamicAutocompleteModule } from '../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../shared/shared.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    NgxIntlTelInputModule,
    AngularEditorModule,
    AppMaterialModule,
    SharedModule,
    DynamicAutocompleteModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgbModule
  ],
  declarations: [
    DynamicFormsComponent,
    FormBuilderComponent,
  ],
  exports:[
    FormBuilderComponent
  ],
  providers: [
    CommonService
  ]
})
export class DynamicFormsModule {}

