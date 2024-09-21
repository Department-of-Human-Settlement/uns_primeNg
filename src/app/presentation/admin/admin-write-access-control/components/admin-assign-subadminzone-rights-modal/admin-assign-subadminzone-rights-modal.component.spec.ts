/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminAssignSubadminzoneRightsModalComponent } from './admin-assign-subadminzone-rights-modal.component';

describe('AdminAssignSubadminzoneRightsModalComponent', () => {
  let component: AdminAssignSubadminzoneRightsModalComponent;
  let fixture: ComponentFixture<AdminAssignSubadminzoneRightsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAssignSubadminzoneRightsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAssignSubadminzoneRightsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
