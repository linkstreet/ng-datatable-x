import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdMenuModule, MdIconModule, MdButtonModule } from '@angular/material';
import { NgDataTableX } from '@linkstreet/ng-datatable-x';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule,
    MdMenuModule,
    MdIconModule,
    MdButtonModule,
    NgDataTableX
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
