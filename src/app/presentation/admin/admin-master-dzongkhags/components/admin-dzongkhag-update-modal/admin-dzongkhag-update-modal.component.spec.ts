/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminDzongkhagUpdateModalComponent } from './admin-dzongkhag-update-modal.component';

describe('AdminDzongkhagUpdateModalComponent', () => {
  let component: AdminDzongkhagUpdateModalComponent;
  let fixture: ComponentFixture<AdminDzongkhagUpdateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDzongkhagUpdateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDzongkhagUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
