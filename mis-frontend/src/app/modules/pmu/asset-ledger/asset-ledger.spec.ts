import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetLedger } from './asset-ledger';

describe('AssetLedger', () => {
  let component: AssetLedger;
  let fixture: ComponentFixture<AssetLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetLedger],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetLedger);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
