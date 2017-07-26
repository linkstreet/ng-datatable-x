import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Http } from '@angular/http';
import { By } from '@angular/platform-browser';

import { NgDataTableX } from '../../';
import { DataTableXComponent } from './datatable.component';

describe('DataTableXComponent', () => {
  let componentFixture: ComponentFixture<DataTableXComponent>;
  let componentInstance: DataTableXComponent;

  // Asynchronous beforeEach.
  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [NgDataTableX]
      });
      TestBed.overrideComponent(DataTableXComponent, {
          set: {
              providers: [
                  {provide: Http, useValue: {}}
              ]
          }
      });
  });

  // Synchronous BeforeEach.
  beforeEach(() => {
    componentFixture = TestBed.createComponent(DataTableXComponent);
    componentInstance = componentFixture.componentInstance;
  });

  it('DataTableXComponent should be defined', () => {
      expect(componentInstance).toBeDefined();
  });
});
