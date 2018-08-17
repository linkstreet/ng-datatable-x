import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableXComponent } from './datatable.component';

describe('DataTableXComponent', () => {
  let component: DataTableXComponent;
  let fixture: ComponentFixture<DataTableXComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTableXComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
