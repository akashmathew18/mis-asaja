import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyOrder } from './supply-order';

describe('SupplyOrder', () => {
  let component: SupplyOrder;
  let fixture: ComponentFixture<SupplyOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplyOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
