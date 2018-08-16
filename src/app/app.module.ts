import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgDataTableX } from './datatable/datatable.module'; 

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgDataTableX
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
