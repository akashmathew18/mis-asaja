import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherExpenses } from './other-expenses';

describe('OtherExpenses', () => {
  let component: OtherExpenses;
  let fixture: ComponentFixture<OtherExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherExpenses],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherExpenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
