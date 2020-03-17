import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {NgbPaginationModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {DataTableXComponent} from './datatable.component';
@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    NgbPaginationModule,
    NgbTooltipModule,
    HttpClientModule
    ],
    declarations: [
    DataTableXComponent
    ],
    exports: [
    DataTableXComponent
    ]
})
export class NgDataTableX {}