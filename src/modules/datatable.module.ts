import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdInputModule, MdSelectModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTableX } from '../component/datatable.component';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MdInputModule, MdSelectModule, NgbModule.forRoot()],
    declarations: [DataTableX],
    exports: [DataTableX]
})
export class NgDataTableX { }