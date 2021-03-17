import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DocumentModuleComponent } from './document-module.component';
import { DocumentFieldValueComponent } from './document-field-value/document-field-value.component';
import { DocumentModuleRoutes } from './document-module-routing';

import { DynamicAutocompleteModule } from '../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../app-material/app-material.module';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { SafeHtmlPipe } from "./safehtml.pipe";

import { NgxSignaturePadModule } from "@o.krucheniuk/ngx-signature-pad";

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(DocumentModuleRoutes),
      FormsModule,
      AppMaterialModule,
      ReactiveFormsModule,
      OwlDateTimeModule,
      OwlNativeDateTimeModule,
      NgxIntlTelInputModule,
      DynamicAutocompleteModule,
      CloudinaryModule.forRoot(cloudinaryLib, config),
      FileUploadModule,
      NgxSignaturePadModule
    ],
    declarations: [
      DocumentModuleComponent,
      DocumentFieldValueComponent,
      SafeHtmlPipe
    ],
    exports: [
      DocumentFieldValueComponent
    ]
})
export class DocumentModuleModule {}