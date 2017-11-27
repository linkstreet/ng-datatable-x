import {NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule, MatSelectModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DataTableXComponent} from './components';
@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, NgbModule.forRoot()],
    declarations: [DataTableXComponent],
    exports: [DataTableXComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class NgDataTableX {}
