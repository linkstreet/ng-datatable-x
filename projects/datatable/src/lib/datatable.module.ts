import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule, MatSelectModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import {DataTableXComponent} from './datatable.component';
@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, NgbModule.forRoot(),
        HttpClientModule],
    declarations: [DataTableXComponent],
    exports: [DataTableXComponent]
})
export class NgDataTableX {}