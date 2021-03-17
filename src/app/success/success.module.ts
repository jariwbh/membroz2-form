import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SuccessComponent } from './success.component';
import { SuccessRoutes } from './success-routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SuccessRoutes),
        FormsModule
    ],
    declarations: [SuccessComponent]
})

export class SuccessModule {}
