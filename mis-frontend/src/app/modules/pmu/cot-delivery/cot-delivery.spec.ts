import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotDelivery } from './cot-delivery';

describe('CotDelivery', () => {
  let component: CotDelivery;
  let fixture: ComponentFixture<CotDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotDelivery],
    }).compileComponents();

    fixture = TestBed.createComponent(CotDelivery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
