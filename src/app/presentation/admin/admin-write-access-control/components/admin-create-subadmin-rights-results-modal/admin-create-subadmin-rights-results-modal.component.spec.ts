/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminCreateSubadminRightsResultsModalComponent } from './admin-create-subadmin-rights-results-modal.component';

describe('AdminCreateSubadminRightsResultsModalComponent', () => {
  let component: AdminCreateSubadminRightsResultsModalComponent;
  let fixture: ComponentFixture<AdminCreateSubadminRightsResultsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateSubadminRightsResultsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateSubadminRightsResultsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
