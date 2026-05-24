import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmLayout } from './firm-layout';

describe('FirmLayout', () => {
  let component: FirmLayout;
  let fixture: ComponentFixture<FirmLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(FirmLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
