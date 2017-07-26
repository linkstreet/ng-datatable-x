import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MdInputModule, MdSelectModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DataTableXComponent} from './components';
@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MdInputModule, MdSelectModule, NgbModule.forRoot()],
    declarations: [DataTableXComponent],
    exports: [DataTableXComponent]
})
export class NgDataTableX {}
