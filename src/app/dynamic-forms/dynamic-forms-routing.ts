import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DynamicFormsComponent } from './dynamic-forms.component';

export const DynamicFormsRoutes: Routes = [
  { path: '', component: DynamicFormsComponent},
  { path: 'form', component: DynamicFormsComponent },
  { path: 'form/:formid', component: DynamicFormsComponent },
  { path: 'form/:formid/:addedby', component: DynamicFormsComponent },
  // { path: 'form/:formid/:id', component: DynamicFormsComponent },
  // { path: 'form/:formid/:contextid/:onModel', component: DynamicFormsComponent },
];

export const routing: ModuleWithProviders<unknown> = RouterModule.forChild(DynamicFormsRoutes);