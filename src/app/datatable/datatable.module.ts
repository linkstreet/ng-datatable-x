import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule, MatSelectModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import {DataTableXComponent} from './datatable.component';
@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, NgbModule.forRoot(),
        HttpClientModule, BrowserAnimationsModule, BrowserModule],
    declarations: [DataTableXComponent],
    exports: [DataTableXComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [
        DataTableXComponent
    ]
})
export class NgDataTableX {}
