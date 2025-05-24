/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnumeratorBuildingSketchesTabComponent } from './enumerator-building-sketches-tab.component';

describe('EnumeratorBuildingSketchesTabComponent', () => {
  let component: EnumeratorBuildingSketchesTabComponent;
  let fixture: ComponentFixture<EnumeratorBuildingSketchesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnumeratorBuildingSketchesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnumeratorBuildingSketchesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
