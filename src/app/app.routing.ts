import { Routes } from '@angular/router';

export const AppRoutes: Routes = [
    {
      path: 'dashboard',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
      path: 'dynamic-forms',
      loadChildren: () => import('./dynamic-forms/dynamic-forms.module').then(m => m.DynamicFormsModule)
    },
    {
      path: 'document-module',
      loadChildren: () => import('./document-module/document-module.module').then(m => m.DocumentModuleModule)
    },
    {
      path: 'success',
      loadChildren: () => import('./success/success.module').then(m => m.SuccessModule)
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    }
];
