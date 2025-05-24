/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnumeratorBuildingPhotosTabComponent } from './enumerator-building-photos-tab.component';

describe('EnumeratorBuildingPhotosTabComponent', () => {
  let component: EnumeratorBuildingPhotosTabComponent;
  let fixture: ComponentFixture<EnumeratorBuildingPhotosTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnumeratorBuildingPhotosTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnumeratorBuildingPhotosTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
