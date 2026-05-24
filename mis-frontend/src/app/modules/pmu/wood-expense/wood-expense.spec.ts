import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoodExpense } from './wood-expense';

describe('WoodExpense', () => {
  let component: WoodExpense;
  let fixture: ComponentFixture<WoodExpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WoodExpense],
    }).compileComponents();

    fixture = TestBed.createComponent(WoodExpense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
