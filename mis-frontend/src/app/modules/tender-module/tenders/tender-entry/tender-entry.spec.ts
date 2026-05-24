import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderEntry } from './tender-entry';

describe('TenderEntry', () => {
  let component: TenderEntry;
  let fixture: ComponentFixture<TenderEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
