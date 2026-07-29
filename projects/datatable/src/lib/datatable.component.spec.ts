import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataTableXComponent } from './datatable.component';

describe('DataTableXComponent', () => {
  let component: DataTableXComponent;
  let fixture: ComponentFixture<DataTableXComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ DataTableXComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableXComponent);
    component = fixture.componentInstance;
    component.config = {
      columns: [],
      colSpans: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
