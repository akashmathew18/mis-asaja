import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDivisions } from './manage-divisions';

describe('ManageDivisions', () => {
  let component: ManageDivisions;
  let fixture: ComponentFixture<ManageDivisions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDivisions],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageDivisions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
