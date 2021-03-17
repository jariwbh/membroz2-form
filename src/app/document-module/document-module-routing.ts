import { Routes } from '@angular/router';
import { DocumentModuleComponent } from './document-module.component';

export const DocumentModuleRoutes: Routes = [
  { path: '',component: DocumentModuleComponent },
  { path: 'form', component: DocumentModuleComponent },
  { path: 'form/:id', component: DocumentModuleComponent },
];
