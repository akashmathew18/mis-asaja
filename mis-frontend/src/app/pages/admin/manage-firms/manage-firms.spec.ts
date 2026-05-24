import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFirms } from './manage-firms';

describe('ManageFirms', () => {
  let component: ManageFirms;
  let fixture: ComponentFixture<ManageFirms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFirms],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFirms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
