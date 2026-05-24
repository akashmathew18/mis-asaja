import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlywoodPurchase } from './plywood-purchase';

describe('PlywoodPurchase', () => {
  let component: PlywoodPurchase;
  let fixture: ComponentFixture<PlywoodPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlywoodPurchase],
    }).compileComponents();

    fixture = TestBed.createComponent(PlywoodPurchase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
